#!/usr/bin/env node
/**
 * Hero-video autoplay hardening guard.
 *
 * The homepage hero video must autoplay inside strict in-app browsers
 * (TikTok, Instagram, Facebook, in-app Safari/Chrome). Those WebViews ignore
 * the bare `autoPlay` attribute and only start playback for a *muted, inline,
 * scripted* play() call — so the hardening is spread across the <video> markup
 * AND an effect that forces the muted/inline properties, calls play(), and
 * retries on the events these WebViews fire late.
 *
 * That behavior cannot be tested in the Replit preview or a desktop browser (it
 * only reproduces on a real phone inside the app). The real risk between those
 * manual, on-device confirmations is a *silent regression*: a routine edit to
 * src/app/page.tsx drops `playsInline`, `muted`, the scripted play(), or one of
 * the retry hooks, and autoplay quietly breaks again in exactly the WebViews we
 * cannot see locally — with nothing failing visibly.
 *
 * This guard is a static source check (no server, no browser). It reads
 * src/app/page.tsx and asserts every piece of the hardening is still present.
 * It fails (exit 1) the moment any required attribute or listener disappears,
 * so a regression is caught before it ships instead of on a user's phone.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PAGE = join(ROOT, 'src', 'app', 'page.tsx');

const src = readFileSync(PAGE, 'utf8');

/**
 * Isolate the hero <video ...> opening tag so attribute checks can't be
 * satisfied by some unrelated element elsewhere on the page.
 */
function heroVideoTag(text) {
  const start = text.indexOf('<video');
  if (start === -1) return null;
  const end = text.indexOf('>', start);
  if (end === -1) return null;
  return text.slice(start, end + 1);
}

const failures = [];
function must(condition, message) {
  if (!condition) failures.push(message);
}

const tag = heroVideoTag(src);
must(tag !== null, 'No <video> element found in src/app/page.tsx (hero video removed?).');

if (tag) {
  // Attributes the browser reads before any script runs.
  must(/\bautoPlay\b/.test(tag), '<video> is missing the `autoPlay` attribute.');
  must(/\bmuted\b/.test(tag), '<video> is missing `muted` (required for any mobile autoplay).');
  must(/\bplaysInline\b/.test(tag), '<video> is missing `playsInline` (WebViews go fullscreen / block autoplay without it).');
  must(/preload=("|\{')?auto/.test(tag), '<video> is missing `preload="auto"` (WebViews need the data ready to autoplay).');
  must(/\bposter=/.test(tag), '<video> is missing a `poster` (clean fallback frame if autoplay is refused).');
}

// The scripted-play hardening: strict WebViews check the *properties*, not just
// the JSX attributes, and only start on an explicit play() call.
must(/\.muted\s*=\s*true/.test(src), 'Missing `video.muted = true` in the autoplay effect.');
must(/\.playsInline\s*=\s*true/.test(src), 'Missing `video.playsInline = true` in the autoplay effect.');
must(/setAttribute\(\s*['"]playsinline['"]/.test(src), "Missing setAttribute('playsinline', ...) (iOS WebView flag).");
must(/setAttribute\(\s*['"]webkit-playsinline['"]/.test(src), "Missing setAttribute('webkit-playsinline', ...) (older iOS WebView flag).");
must(/\.play\(\)/.test(src), 'Missing a scripted `video.play()` call (bare autoPlay is ignored by strict WebViews).');

// Retry hooks: these WebViews often reject the first play() and only allow it
// later, on one of these signals. Losing them re-breaks autoplay silently.
must(/addEventListener\(\s*['"]canplay['"]/.test(src), "Missing `canplay` retry listener.");
must(/addEventListener\(\s*['"]loadeddata['"]/.test(src), "Missing `loadeddata` retry listener.");
must(/addEventListener\(\s*['"]visibilitychange['"]/.test(src), "Missing `visibilitychange` retry listener.");
must(/IntersectionObserver/.test(src), 'Missing IntersectionObserver retry (play when the hero scrolls into view).');
must(/addEventListener\(\s*['"]touchstart['"]/.test(src), "Missing `touchstart` first-gesture retry listener.");
must(/addEventListener\(\s*['"]click['"]/.test(src), "Missing `click` first-gesture retry listener.");

if (failures.length > 0) {
  console.error(`\nHero-autoplay guard FAILED with ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    '\nThese pieces make the hero video autoplay inside TikTok/Instagram/Facebook ' +
      'in-app browsers. Restore them in src/app/page.tsx, then re-run the on-device ' +
      'confirmation (this behavior cannot be tested in the preview or a desktop browser).',
  );
  process.exit(1);
}

console.log('Hero-autoplay guard passed: all autoplay hardening is present in src/app/page.tsx.');
