import type { Metadata } from 'next';

export const SITE_URL = 'https://ameraiot.com';
export const SITE_NAME = 'Amera Technologies';
export const DEFAULT_OG_IMAGE = '/assets/og-default.jpg';

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

interface PageMetaInput {
  /** Full <title> for the page (e.g. "Industries — Amera Technologies"). */
  title: string;
  /** Search/social description, ~150–160 chars. */
  description: string;
  /** Route path beginning with "/" (use "" for the home page). */
  path: string;
  /** Social preview image. Relative paths resolve against metadataBase; absolute URLs pass through. Omit to use the sitewide default card. */
  image?: string;
  /** Alt text for the social preview image. */
  imageAlt?: string;
  /** Provide width/height only for known fixed-size cards (e.g. the 1200x630 product cards) so scrapers get dimensions up front. Leave unset for arbitrary-size images. */
  imageWidth?: number;
  imageHeight?: number;
}

/**
 * Build a complete Metadata object for a route: canonical URL plus matching
 * Open Graph and Twitter preview cards. Keeps every public page's social
 * preview consistent and prevents the og:title/og:description from silently
 * falling back to the sitewide defaults (App Router merges nested metadata
 * objects shallowly, so each route must set them explicitly).
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const usingDefault = image === undefined;

  const ogImage: { url: string; alt: string; width?: number; height?: number } = {
    url: image ?? DEFAULT_OG_IMAGE,
    alt: imageAlt ?? title,
  };
  if (usingDefault) {
    ogImage.width = OG_IMAGE_WIDTH;
    ogImage.height = OG_IMAGE_HEIGHT;
  } else if (imageWidth && imageHeight) {
    ogImage.width = imageWidth;
    ogImage.height = imageHeight;
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      title,
      description,
      url,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  };
}
