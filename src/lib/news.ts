export interface Article {
  title: string;
  link: string;
  source: string;
  summary: string;
  pubDate: string;
  category: string;
  score: number;
  pinned?: boolean;
}

interface FeedConfig {
  url: string;
  source: string;
  alwaysInclude?: boolean;
}

interface CacheShape {
  ts: number;
  data: Article[];
}

const GOOGLE_QUERY =
  '("post-quantum cryptography" OR "quantum-resistant encryption" OR "quantum safe" OR "IoT security" OR "symmetric key management" OR "encryption key distribution" OR "passwordless authentication" OR "secure document signing") -crypto -bitcoin -blockchain';
const GOOGLE_NEWS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(
  GOOGLE_QUERY,
)}&hl=en-US&gl=US&ceid=US:en`;

const FEEDS: FeedConfig[] = [
  { url: GOOGLE_NEWS_URL, source: 'Google News' },
  { url: 'https://www.bleepingcomputer.com/feed/', source: 'BleepingComputer' },
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News' },
  { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', source: 'CISA' },
  { url: 'https://www.schneier.com/feed/atom/', source: 'Schneier on Security', alwaysInclude: true },
];

const TTL = 30 * 60 * 1000;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
let cache: CacheShape | null = null;

const TOPICS: { label: string; re: RegExp; weight: number }[] = [
  { label: 'Post-Quantum', re: /post[- ]?quantum|quantum[- ]?(resistant|safe)|\bpqc\b|\bqkd\b/i, weight: 6 },
  { label: 'Quantum Security', re: /quantum/i, weight: 3 },
  { label: 'IoT Security', re: /\biot\b|internet of things|embedded device|\bot security\b|smart device/i, weight: 5 },
  { label: 'Key Management', re: /key management|symmetric key|encryption key|key distribution|key exchange|\bkms\b|\bhsm\b/i, weight: 5 },
  { label: 'Passwordless', re: /passwordless|passkey|fido2?|webauthn/i, weight: 5 },
  { label: 'Document Signing', re: /document signing|digital signature|e-?signature|signing certificate|code signing/i, weight: 5 },
  { label: 'Encryption', re: /encrypt|cryptograph|cipher|\btls\b|\bpki\b/i, weight: 2 },
  { label: 'Cybersecurity', re: /ransomware|malware|breach|vulnerabilit|exploit|cve-|zero[- ]day|phishing|cyber|advisory/i, weight: 1 },
];

const EXCLUDE_RE =
  /\b(bitcoin|ethereum|blockchain|crypto(?:currenc(?:y|ies)|[- ]?(?:currency|trading|exchange|wallet|market|token|coin|miner|mining))|cryptocurrenc|memecoin|altcoin|dogecoin|\bnft\b|defi\b|web3|stablecoin|\bipo\b|earnings call|stock market|share price)\b/i;

const FINANCE_RE =
  /\b(price target|buy rating|sell rating|hold rating|analyst rating|upgraded to|downgraded to|market cap|quarterly results|quarterly earnings|earnings per share|\beps\b|dividend|\bstocks?\b|shares? (?:rose|fell|jumped|surged|dropped|gained)|\(nasdaq:|\(nyse:|nasdaq:\s|nyse:\s)\b/i;

const SOURCE_DENYLIST =
  /tradingview|marketscreener|investorplace|seeking\s?alpha|motley\s?fool|fool\.com|benzinga|zacks|simply\s?wall|stock\s?twits|barchart|tipranks|insider\s?monkey|gurufocus|stock\s?titan|marketbeat|investing\.com/i;

function decodeOnce(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(input: string): string {
  return input.replace(/<[^>]+>/g, ' ');
}

function decodeEntities(input: string): string {
  let s = input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  s = stripTags(s);
  s = decodeOnce(s);
  s = stripTags(s);
  s = decodeOnce(s);
  return s.replace(/\s+/g, ' ').trim();
}

function extractTag(block: string, name: string): string | null {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? match[1] : null;
}

function extractAllTags(block: string, name: string): string[] {
  const matches = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'gi')) || [];
  return matches
    .map((m) => {
      const inner = m.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
      return inner ? decodeEntities(inner[1]) : '';
    })
    .filter(Boolean);
}

function extractLink(block: string): string | null {
  const rss = extractTag(block, 'link');
  if (rss) {
    const v = decodeEntities(rss);
    if (/^https?:\/\//i.test(v)) return v;
  }
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
  if (alt) return alt[1];
  const any = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  if (any) return any[1];
  return null;
}

function truncate(text: string, max = 180): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '').trim() + '…';
}

function isSponsored(title: string, categories: string[], block: string): boolean {
  const haystack = `${title} ${categories.join(' ')}`.toLowerCase();
  if (/sponsor|sponsored|paid content|advertorial/.test(haystack)) return true;
  const creator = extractTag(block, 'dc:creator');
  if (creator && /sponsor/i.test(decodeEntities(creator))) return true;
  return false;
}

function scoreAndCategorize(text: string, fallbackCategory: string): { score: number; category: string } {
  let score = 0;
  let category = '';
  let bestWeight = 0;
  for (const topic of TOPICS) {
    if (topic.re.test(text)) {
      score += topic.weight;
      if (topic.weight > bestWeight) {
        bestWeight = topic.weight;
        category = topic.label;
      }
    }
  }
  return { score, category: category || fallbackCategory };
}

async function fetchFeed(feed: FeedConfig): Promise<Article[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AmeraNewsBot/1.0)' },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const blocks = [
      ...(xml.match(/<item[\s>][\s\S]*?<\/item>/g) || []),
      ...(xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) || []),
    ];
    const articles: Article[] = [];

    for (const block of blocks) {
      const rawTitle = extractTag(block, 'title');
      const link = extractLink(block);
      if (!rawTitle || !link) continue;
      if (!/^https?:\/\//i.test(link)) continue;

      let title = decodeEntities(rawTitle);

      const categories = extractAllTags(block, 'category');
      if (isSponsored(title, categories, block)) continue;

      let source = feed.source;
      const sourceTag = extractTag(block, 'source');
      if (sourceTag) {
        source = decodeEntities(sourceTag);
        const dashIdx = title.lastIndexOf(` - ${source}`);
        if (dashIdx > 0) title = title.slice(0, dashIdx).trim();
      }
      if (SOURCE_DENYLIST.test(source)) continue;

      const rawSummary =
        extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content');
      let summary = rawSummary ? truncate(decodeEntities(rawSummary)) : '';
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (summary && norm(summary).startsWith(norm(title))) summary = '';

      const rawPub =
        extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated');
      const parsed = rawPub ? new Date(decodeEntities(rawPub)) : null;
      const pubDate = parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : '';

      if (!parsed || isNaN(parsed.getTime()) || parsed.getTime() < Date.now() - MAX_AGE_MS) continue;

      const haystack = `${title} ${summary} ${categories.join(' ')}`;
      if (EXCLUDE_RE.test(haystack) || FINANCE_RE.test(haystack)) continue;

      const { score, category } = scoreAndCategorize(haystack, categories[0] || 'Cybersecurity');

      articles.push({ title, link, source, summary, pubDate, category, score, pinned: feed.alwaysInclude });
    }

    return articles;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function buildFeed(articles: Article[]): Article[] {
  const seenLink = new Set<string>();
  const seenTitle = new Set<string>();
  const deduped: Article[] = [];
  for (const a of articles) {
    const linkKey = a.link.toLowerCase();
    const titleKey = a.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (seenLink.has(linkKey) || (titleKey && seenTitle.has(titleKey))) continue;
    seenLink.add(linkKey);
    if (titleKey) seenTitle.add(titleKey);
    deduped.push(a);
  }

  const byRecency = (a: Article, b: Article) => (b.pubDate || '').localeCompare(a.pubDate || '');

  const pinned = deduped.filter((a) => a.pinned).sort(byRecency);

  const ranked = deduped
    .filter((a) => !a.pinned)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return byRecency(a, b);
    });

  return [...pinned, ...ranked.slice(0, Math.max(0, 12 - pinned.length))];
}

export async function getNewsFeed(): Promise<{ articles: Article[]; cachedAt: string; stale?: boolean }> {
  if (cache && Date.now() - cache.ts < TTL) {
    return { articles: cache.data, cachedAt: new Date(cache.ts).toISOString() };
  }

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const all: Article[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') all.push(...result.value);
  }

  const latest = buildFeed(all);

  if (latest.length > 0) {
    cache = { ts: Date.now(), data: latest };
    return { articles: latest, cachedAt: new Date().toISOString() };
  }

  if (cache) {
    return { articles: cache.data, cachedAt: new Date(cache.ts).toISOString(), stale: true };
  }

  return { articles: [], cachedAt: new Date().toISOString() };
}
