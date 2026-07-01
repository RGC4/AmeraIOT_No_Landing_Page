import React from 'react';
import { headers } from 'next/headers';
import Header from '@/components/Header';
import Link from 'next/link';
import Footer from '@/components/Footer';
import NewsHero from './NewsHero';
import JsonLd from '@/components/JsonLd';
import { getNewsFeed, Article } from '@/lib/news';

export const revalidate = 1800;

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.236 4.53L7.73 10.53a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.137-.089l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArticleCard({ item, idx }: { item: Article; idx: number }) {
  return (
    <article key={`${item.link}-${idx}`} className="card-on-gray p-6 flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-primary border border-[#4D9FD6] truncate max-w-[65%]">
          <ShieldIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {item.category}
        </span>
        {item.pubDate && (
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
            {formatDate(item.pubDate)}
          </span>
        )}
      </div>

      <h2 className="mt-4 text-lg font-bold text-gray-900 leading-snug">{item.title}</h2>

      {item.source && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-[#114D8F]">
          <ShieldIcon className="w-4 h-4 flex-shrink-0" />
          {item.source}
        </p>
      )}

      {item.summary && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed flex-grow">{item.summary}</p>
      )}

      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-semibold transition-colors duration-200"
      >
        Read article
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
          <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
        </svg>
      </a>
    </article>
  );
}

export default async function NewsPage() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  let articles: Article[] = [];
  let fetchFailed = false;

  try {
    const result = await getNewsFeed();
    articles = result.articles;
  } catch {
    fetchFailed = true;
  }

  const itemListSchema =
    articles.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Cybersecurity & Quantum Security News',
          description:
            'A curated feed of the latest cybersecurity, post-quantum cryptography, and IoT security news.',
          numberOfItems: articles.length,
          itemListElement: articles.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'NewsArticle',
              headline: item.title,
              url: item.link,
              datePublished: item.pubDate || undefined,
              description: item.summary || undefined,
              publisher: {
                '@type': 'Organization',
                name: item.source,
              },
            },
          })),
        }
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <NewsHero />

      {itemListSchema && <JsonLd data={itemListSchema} nonce={nonce} />}

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14 sm:pb-16">
        {fetchFailed && (
          <div className="card-on-gray p-10 text-center">
            <h2 className="text-lg font-bold text-gray-900">
              We couldn&rsquo;t load the news feed right now.
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Please refresh the page in a moment to try again.
            </p>
          </div>
        )}

        {!fetchFailed && articles.length === 0 && (
          <div className="card-on-gray p-10 text-center">
            <h2 className="text-lg font-bold text-gray-900">No recent articles found.</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Check back soon &mdash; the feed updates throughout the day.
            </p>
          </div>
        )}

        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item, idx) => (
              <ArticleCard key={`${item.link}-${idx}`} item={item} idx={idx} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
