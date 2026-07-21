#!/usr/bin/env node
/**
 * Structured-data (JSON-LD) guard.
 *
 * Google shows rich results (organization info, breadcrumbs, products, news)
 * only when each page emits its JSON-LD `<script type="application/ld+json">`
 * block. That structured data is produced from a central registry
 * (src/lib/structured-data.ts). A typo in a pathname key or a missing registry
 * entry for a new route would silently remove a page's structured data without
 * breaking the page visually.
 *
 * Beyond presence, a schema can *parse* yet still be malformed for Google: the
 * wrong @type, a missing required property (a Product without a name), or a
 * BreadcrumbList with broken positions are silently dropped from rich results.
 * So this guard also validates the shape of each payload (see SHAPE VALIDATION
 * below).
 *
 * This check fails (exit 1) when:
 *   - a known route stops emitting its expected JSON-LD block(s);
 *   - any emitted JSON-LD block's JSON does not parse;
 *   - the site-wide Organization/WebSite graph is missing or loses a required
 *     property on any route;
 *   - a route's own schema has the wrong @type or is missing a required
 *     property / valid URL for that type;
 *   - a new page route appears in src/app that this guard has not classified
 *     (forcing the author to register schema for it or mark it schema-free).
 *
 * It manages its own server. By default (dev mode) it reuses a server already
 * serving at BASE_URL (default http://localhost:5000) or starts `next dev`.
 * With `--prod` (or STRUCTURED_DATA_PROD=1) it instead runs a real `next build`
 * and `next start` (default port 3000) so the checks run under the PRODUCTION
 * CSP — catching regressions that only appear in a prod build. Either way it
 * shuts the server down when finished.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APP_DIR = join(ROOT, 'src', 'app');

/**
 * Production mode (`--prod` or STRUCTURED_DATA_PROD=1): build the app and serve
 * it with `next start` so the checks run under the production CSP
 * (src/middleware.ts buildCsp, NODE_ENV==='production') instead of the relaxed
 * dev policy. This catches regressions that only manifest in a prod build. The
 * production CSP is a static `script-src 'self' 'unsafe-inline'` (no per-request
 * nonce, no 'unsafe-eval') plus 'upgrade-insecure-requests'. Dev mode keeps
 * using `next dev`.
 */
const PROD = process.argv.includes('--prod') || process.env.STRUCTURED_DATA_PROD === '1';
const DEFAULT_PORT = PROD ? '3000' : '5000';
const BASE_URL = (process.env.BASE_URL || `http://localhost:${DEFAULT_PORT}`).replace(/\/$/, '');

/**
 * The complete classification of every page route in src/app.
 *   - registry : route-specific schema comes from src/lib/structured-data.ts,
 *                rendered in addition to the site-wide schema -> expect >= 2.
 *   - self     : the page builds its own schema inline (e.g. /news article
 *                feed). The list block only renders when there is content, so
 *                we require the site-wide block always and the list when the
 *                page shows articles.
 *   - sitewide : only the site-wide Organization/WebSite schema from the root
 *                layout -> expect exactly 1.
 *
 * `schemaType` is the expected top-level @type of the *route* block (the one in
 * addition to the site-wide @graph). When set, the route block must exist, be
 * that @type, and pass that type's required-property checks. Routes without a
 * `schemaType` only carry the site-wide graph.
 *
 * Every route discovered in src/app MUST appear here. A new route that is not
 * listed makes the guard fail, so structured data can never silently regress.
 */
const EXPECTED = {
  '/': { kind: 'sitewide', minBlocks: 1 },
  '/news': {
    kind: 'self',
    minBlocks: 1,
    minBlocksWithContent: 2,
    // The ItemList only renders when the feed has articles. Whether the feed
    // has content is detected from the structured data itself (the presence of
    // the ItemList JSON-LD block) rather than by matching visible UI text like
    // a "Read article" label, which could be reworded and silently skip
    // validating the news schema. Validated only when that block is present.
    schemaType: 'ItemList',
    schemaWhenContent: true,
    itemList: { itemType: 'NewsArticle', itemRequiresUrl: true },
  },
  '/company': { kind: 'registry', minBlocks: 2, schemaType: 'AboutPage' },
  '/company/board-of-advisors': { kind: 'registry', minBlocks: 2, schemaType: 'ItemList', itemList: { itemType: 'Person' } },
  '/company/executive-team': { kind: 'registry', minBlocks: 2, schemaType: 'ItemList', itemList: { itemType: 'Person' } },
  '/company/patents': { kind: 'sitewide', minBlocks: 1 },
  '/company/vision-and-mission': { kind: 'sitewide', minBlocks: 1 },
  '/contact': { kind: 'sitewide', minBlocks: 1 },
  // Private, noindex admin inbox — carries only the site-wide graph from the
  // root layout; it is never meant to appear in search results.
  '/admin/messages': { kind: 'sitewide', minBlocks: 1 },
  '/privacy-policy': { kind: 'sitewide', minBlocks: 1 },
  '/terms-of-service': { kind: 'sitewide', minBlocks: 1 },
  '/resources': { kind: 'registry', minBlocks: 2, schemaType: 'CollectionPage' },
  '/products/amerakey': { kind: 'registry', minBlocks: 2, schemaType: 'Product' },
  '/products/amerasecrets': { kind: 'registry', minBlocks: 2, schemaType: 'Product' },
  '/industries': { kind: 'registry', minBlocks: 2, schemaType: 'CollectionPage' },
  '/industries/[slug]': { kind: 'registry', minBlocks: 2, dynamic: true, schemaType: 'BreadcrumbList' },
};

const failures = [];
const notes = [];
function fail(msg) {
  failures.push(msg);
}

/* ------------------------- shape validation helpers ----------------------- */

function isObj(x) {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}
function isNonEmptyStr(x) {
  return typeof x === 'string' && x.trim().length > 0;
}
function isValidUrl(x) {
  if (!isNonEmptyStr(x)) return false;
  try {
    // Schemas use absolute https URLs.
    return /^https?:\/\//i.test(x) && !!new URL(x);
  } catch {
    return false;
  }
}

/** Require a set of non-empty string props on a node. */
function requireStrings(node, props, where, errors) {
  for (const p of props) {
    if (!isNonEmptyStr(node[p])) errors.push(`${where}: missing required "${p}".`);
  }
}

/** Validate a BreadcrumbList node (sequential positions, names, valid URLs). */
function checkBreadcrumb(bc, where, errors) {
  if (!isObj(bc)) {
    errors.push(`${where}: missing BreadcrumbList.`);
    return;
  }
  if (bc['@type'] !== 'BreadcrumbList') {
    errors.push(`${where}: @type is "${bc['@type']}", expected "BreadcrumbList".`);
  }
  const items = bc.itemListElement;
  if (!Array.isArray(items) || items.length === 0) {
    errors.push(`${where}: BreadcrumbList has no itemListElement.`);
    return;
  }
  items.forEach((li, i) => {
    if (!isObj(li) || li['@type'] !== 'ListItem') {
      errors.push(`${where}: item[${i}] @type is not "ListItem".`);
      return;
    }
    if (li.position !== i + 1) {
      errors.push(`${where}: item[${i}] position is ${JSON.stringify(li.position)}, expected ${i + 1}.`);
    }
    if (!isNonEmptyStr(li.name)) errors.push(`${where}: item[${i}] missing "name".`);
    if (!isValidUrl(li.item)) errors.push(`${where}: item[${i}] "item" is not a valid URL.`);
  });
}

/** Validate an ItemList node (sequential positions; each item has a type+name). */
function checkItemList(node, where, errors, opts = {}) {
  requireStrings(node, ['name'], where, errors);
  const items = node.itemListElement;
  if (!Array.isArray(items) || items.length === 0) {
    errors.push(`${where}: ItemList has no itemListElement.`);
    return;
  }
  items.forEach((li, i) => {
    if (!isObj(li) || li['@type'] !== 'ListItem') {
      errors.push(`${where}: item[${i}] @type is not "ListItem".`);
      return;
    }
    if (li.position !== i + 1) {
      errors.push(`${where}: item[${i}] position is ${JSON.stringify(li.position)}, expected ${i + 1}.`);
    }
    const item = li.item;
    if (!isObj(item)) {
      errors.push(`${where}: item[${i}] missing "item" object.`);
      return;
    }
    if (opts.itemType && item['@type'] !== opts.itemType) {
      errors.push(`${where}: item[${i}].item @type is "${item['@type']}", expected "${opts.itemType}".`);
    } else if (!isNonEmptyStr(item['@type'])) {
      errors.push(`${where}: item[${i}].item missing "@type".`);
    }
    // NewsArticle uses "headline"; Person/etc use "name".
    if (!isNonEmptyStr(item.name) && !isNonEmptyStr(item.headline)) {
      errors.push(`${where}: item[${i}].item missing "name"/"headline".`);
    }
    if (opts.itemRequiresUrl && !isValidUrl(item.url)) {
      errors.push(`${where}: item[${i}].item "url" is not a valid URL.`);
    }
  });
}

/**
 * Validate the site-wide Organization + WebSite @graph that the root layout
 * renders on every page. `parsed` is the list of parsed JSON-LD payloads.
 */
function checkSiteWide(parsed, where, errors) {
  const graph = parsed.find((j) => isObj(j) && Array.isArray(j['@graph']));
  if (!graph) {
    errors.push(`${where}: site-wide @graph (Organization/WebSite) block not found.`);
    return;
  }
  const nodes = graph['@graph'];
  const org = nodes.find((n) => isObj(n) && n['@type'] === 'Organization');
  const site = nodes.find((n) => isObj(n) && n['@type'] === 'WebSite');
  if (!org) errors.push(`${where}: site-wide @graph missing Organization.`);
  else {
    requireStrings(org, ['@id', 'name'], `${where} Organization`, errors);
    if (!isValidUrl(org.url)) errors.push(`${where} Organization: "url" is not a valid URL.`);
  }
  if (!site) errors.push(`${where}: site-wide @graph missing WebSite.`);
  else {
    requireStrings(site, ['name'], `${where} WebSite`, errors);
    if (!isValidUrl(site.url)) errors.push(`${where} WebSite: "url" is not a valid URL.`);
  }
}

/**
 * SHAPE VALIDATION: validate the route-specific block against its expected
 * @type and that type's required properties.
 */
function checkRouteSchema(path, cfg, parsed, errors) {
  if (!cfg.schemaType) return;
  const node = parsed.find((j) => isObj(j) && j['@type'] === cfg.schemaType);
  if (!node) {
    errors.push(`${path}: no JSON-LD block with @type "${cfg.schemaType}" found.`);
    return;
  }
  const where = `${path} ${cfg.schemaType}`;
  switch (cfg.schemaType) {
    case 'AboutPage':
      requireStrings(node, ['name'], where, errors);
      if (!isValidUrl(node.url)) errors.push(`${where}: "url" is not a valid URL.`);
      checkBreadcrumb(node.breadcrumb, `${where}.breadcrumb`, errors);
      break;
    case 'CollectionPage':
      requireStrings(node, ['name'], where, errors);
      if (!isValidUrl(node.url)) errors.push(`${where}: "url" is not a valid URL.`);
      if (Array.isArray(node.hasPart)) {
        node.hasPart.forEach((part, i) => {
          if (!isObj(part) || !isNonEmptyStr(part.name)) {
            errors.push(`${where}: hasPart[${i}] missing "name".`);
          }
          if (isObj(part) && part.url !== undefined && !isValidUrl(part.url)) {
            errors.push(`${where}: hasPart[${i}] "url" is not a valid URL.`);
          }
        });
      }
      break;
    case 'Product':
      requireStrings(node, ['name'], where, errors);
      if (!isValidUrl(node.url)) errors.push(`${where}: "url" is not a valid URL.`);
      break;
    case 'ItemList':
      checkItemList(node, where, errors, cfg.itemList || {});
      break;
    case 'BreadcrumbList':
      checkBreadcrumb(node, where, errors);
      break;
    default:
      errors.push(`${where}: no validator defined for @type "${cfg.schemaType}".`);
  }
}

/* ----------------------------- route discovery ---------------------------- */

/** Walk src/app and return the URL path of every `page.tsx` route. */
function discoverRoutes() {
  const routes = [];
  function walk(dir, segments) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        // Route groups like (marketing) do not add a URL segment.
        const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
        walk(join(dir, entry.name), isGroup ? segments : [...segments, entry.name]);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        routes.push('/' + segments.join('/') || '/');
      }
    }
  }
  walk(APP_DIR, []);
  return routes.map((r) => (r === '' ? '/' : r));
}

/** Pick a real industry slug so the dynamic /industries/[slug] route resolves. */
function sampleIndustrySlug() {
  const file = join(APP_DIR, 'industries', '[slug]', 'industry-meta.ts');
  const src = readFileSync(file, 'utf8');
  // Match the first top-level key inside `industryMeta = { ... }`.
  const match = src.match(/industryMeta[^{]*\{\s*'?([a-z0-9-]+)'?\s*:/);
  if (!match) throw new Error('Could not determine a sample industry slug from industry-meta.ts');
  return match[1];
}

/* ------------------------------- html parsing ----------------------------- */

/** Extract every <script type="application/ld+json"> block from HTML. */
function extractJsonLd(html) {
  const blocks = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    if (!/type\s*=\s*"application\/ld\+json"/i.test(attrs)) continue;
    const body = m[2].trim();
    let json = null;
    let valid = true;
    try {
      json = JSON.parse(body);
    } catch {
      valid = false;
    }
    blocks.push({
      body,
      json,
      valid,
    });
  }
  return blocks;
}

/* ------------------------------ server control ---------------------------- */

async function reachable(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function fetchHtml(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    const body = await res.text();
    return { status: res.status, body };
  } finally {
    clearTimeout(t);
  }
}

/**
 * In production mode, prove the server we're about to check is actually serving
 * the production CSP — not a dev server (or some other service) that happens to
 * be reachable at BASE_URL. Without this, prod-mode reuse could pass against a
 * relaxed policy and give a false sense of safety. Fails fast on any mismatch.
 */
async function assertProdCsp(baseUrl) {
  const before = failures.length;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  let csp = '';
  try {
    const res = await fetch(baseUrl, { signal: ctrl.signal });
    csp = res.headers.get('content-security-policy') || '';
  } catch (err) {
    fail(`--prod: could not read CSP header from ${baseUrl}: ${err.message}`);
    return;
  } finally {
    clearTimeout(t);
  }

  if (!csp) {
    fail(`--prod: ${baseUrl} sent no Content-Security-Policy header — not a production server.`);
    return;
  }
  const scriptSrc = (csp.match(/script-src[^;]*/i) || [''])[0];
  // Production uses a static script-src 'self' 'unsafe-inline' (no per-request
  // nonce — see src/middleware.ts). It must NOT contain 'unsafe-eval' (dev-only,
  // for HMR), and the response must carry the production-only
  // 'upgrade-insecure-requests' directive. Together these distinguish the prod
  // CSP from the relaxed dev policy.
  if (!scriptSrc) {
    fail(`--prod: no script-src directive — not a valid CSP. Got: ${csp}`);
  }
  if (/'unsafe-eval'/.test(scriptSrc)) {
    fail(`--prod: script-src allows 'unsafe-eval' — this is the dev/relaxed CSP, not production. Got: ${scriptSrc}`);
  }
  if (!/upgrade-insecure-requests/.test(csp)) {
    fail(`--prod: CSP is missing 'upgrade-insecure-requests' — not the production policy. Got: ${csp}`);
  }
  if (failures.length === before) {
    console.log(`--prod: confirmed production CSP (script-src 'self' 'unsafe-inline', no unsafe-eval, upgrade-insecure-requests).`);
  }
}

/** Run `next build`, resolving when it exits 0. Used only in production mode. */
function runBuild() {
  return new Promise((resolve, reject) => {
    console.log('Production mode: running "next build"...');
    // The sandbox build OOMs at the default heap; raise it (harmless elsewhere).
    const extraHeap = '--max-old-space-size=4096';
    const nodeOptions = process.env.NODE_OPTIONS
      ? `${process.env.NODE_OPTIONS} ${extraHeap}`
      : extraHeap;
    const proc = spawn('npx', ['next', 'build'], {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: nodeOptions },
    });
    proc.on('error', reject);
    proc.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`next build failed (exit ${code}).`)),
    );
  });
}

/**
 * Start the app server and wait until it answers. In production mode it runs a
 * real `next build` then `next start` (strict nonce-based CSP); otherwise
 * `next dev` (relaxed CSP). Returns the spawned process so it can be torn down.
 */
async function startServer() {
  const port = new URL(BASE_URL).port || DEFAULT_PORT;

  if (PROD) {
    await runBuild();
    console.log(`Starting "next start -p ${port}" (production CSP)...`);
  } else {
    // Grace period: the main "Start application" workflow may still be booting.
    // Waiting here avoids stealing its port and leaving it stuck in EADDRINUSE.
    console.log(`No server reachable at ${BASE_URL}; waiting up to 90s for the app workflow...`);
    const grace = Date.now() + 90000;
    while (Date.now() < grace) {
      if (await reachable(BASE_URL)) {
        console.log(`Server appeared at ${BASE_URL}; reusing it.`);
        return null;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    console.log(`Still no server at ${BASE_URL}; starting "next dev -p ${port}"...`);
  }

  const command = PROD ? ['next', 'start', '-p', port] : ['next', 'dev', '-p', port];
  const proc = spawn('npx', command, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});

  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (await reachable(BASE_URL)) return proc;
    await new Promise((r) => setTimeout(r, 1500));
  }
  proc.kill('SIGKILL');
  throw new Error(`Timed out waiting for the ${PROD ? 'production' : 'dev'} server to start.`);
}

/* ---------------------------------- main ---------------------------------- */

async function main() {
  // 1) New-route guard: every page route must be classified above.
  const discovered = discoverRoutes();
  for (const route of discovered) {
    if (!(route in EXPECTED)) {
      fail(
        `New route "${route}" is not classified in scripts/check-structured-data.mjs. ` +
          `Add a JSON-LD entry in src/lib/structured-data.ts (or mark it schema-free) ` +
          `and classify it in EXPECTED so its search-result data is guarded.`,
      );
    }
  }
  for (const route of Object.keys(EXPECTED)) {
    if (!discovered.includes(route)) {
      notes.push(`Classified route "${route}" no longer exists in src/app (stale entry?).`);
    }
  }

  const slug = sampleIndustrySlug();

  // 2) Ensure a server is available. In production mode we always build+start
  //    our own server so the checks run under the strict CSP — but if a server
  //    is already serving at BASE_URL (e.g. a prod server you started), reuse it.
  console.log(`Mode: ${PROD ? 'production (next build + next start)' : 'development (next dev)'}.`);
  let spawned = null;
  if (!(await reachable(BASE_URL))) {
    spawned = await startServer();
  } else {
    console.log(`Using server already running at ${BASE_URL}.`);
  }

  try {
    // In prod mode, refuse to run unless the reachable server is genuinely
    // serving the strict production CSP (guards against reusing a dev server).
    if (PROD) {
      await assertProdCsp(BASE_URL);
    }

    // 3) HTTP check: each route still emits its JSON-LD block(s), valid JSON,
    //    and well-formed for Google (correct @type + required props).
    for (const [pattern, cfg] of Object.entries(EXPECTED)) {
      const path = cfg.dynamic ? pattern.replace('[slug]', slug) : pattern;
      const url = BASE_URL + path;
      let res;
      try {
        res = await fetchHtml(url);
      } catch (err) {
        fail(`${path}: request failed (${err.message}).`);
        continue;
      }
      if (res.status >= 400) {
        fail(`${path}: HTTP ${res.status}.`);
        continue;
      }

      const blocks = extractJsonLd(res.body);
      const parsed = blocks.filter((b) => b.valid).map((b) => b.json);

      // For a 'self' route whose route schema only renders with content, decide
      // whether the feed has content from the structured data itself — the
      // presence of the route's JSON-LD block (its @type) — instead of matching
      // visible UI text. Wording of an on-screen label could change without the
      // feed being empty, which would wrongly skip validating the news schema.
      const hasContent =
        cfg.kind === 'self' && cfg.schemaWhenContent && cfg.schemaType
          ? parsed.some((j) => isObj(j) && j['@type'] === cfg.schemaType)
          : false;

      let required = cfg.minBlocks;
      if (cfg.kind === 'self' && hasContent) {
        required = cfg.minBlocksWithContent;
      }

      if (blocks.length < required) {
        fail(
          `${path}: expected at least ${required} JSON-LD block(s), found ${blocks.length}. ` +
            `Likely a missing/typo'd registry key in src/lib/structured-data.ts.`,
        );
      }

      blocks.forEach((b, i) => {
        if (!b.valid) {
          fail(`${path}: JSON-LD block #${i + 1} is not valid JSON.`);
        }
      });

      // SHAPE VALIDATION on the parsed payloads (parsed above).
      const routeErrors = [];
      checkSiteWide(parsed, path, routeErrors);
      // Validate the route block, except for 'self' routes whose schema only
      // appears with content (skip when the feed is empty to stay non-flaky).
      if (!(cfg.schemaWhenContent && !hasContent)) {
        checkRouteSchema(path, cfg, parsed, routeErrors);
      }
      routeErrors.forEach((e) => fail(e));

      const ok =
        blocks.length >= required &&
        blocks.every((b) => b.valid) &&
        routeErrors.length === 0;
      console.log(
        `  [${ok ? 'ok' : 'FAIL'}] ${path}  (${blocks.length} block(s), ${required} required` +
          `${cfg.schemaType ? `, @type ${cfg.schemaType}` : ''})`,
      );
    }
  } finally {
    if (spawned) {
      spawned.kill('SIGKILL');
    }
  }

  for (const note of notes) console.log(`note: ${note}`);

  if (failures.length > 0) {
    console.error(`\nStructured-data check FAILED (${failures.length} issue(s)):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('\nStructured-data check passed: every route emits well-formed JSON-LD.');
}

// Crawl the live site only when invoked directly. Importing this module (e.g.
// from the validator unit tests in check-structured-data-validators.mjs) must
// NOT start a server — it should only pull in the shape-validation helpers.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Structured-data check errored:', err);
    process.exit(1);
  });
}

// Exported so the shape-validation helpers can be unit-tested in isolation,
// guarding against one of them being silently weakened (the failure mode the
// structured-data guard exists to prevent).
export {
  isObj,
  isNonEmptyStr,
  isValidUrl,
  requireStrings,
  checkBreadcrumb,
  checkItemList,
  checkSiteWide,
  checkRouteSchema,
};
