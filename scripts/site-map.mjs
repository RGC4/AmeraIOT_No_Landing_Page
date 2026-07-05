#!/usr/bin/env node
/**
 * Generates a visual site map: screenshots every page of the site and lays
 * them out as a connected tree, saved as exports/site-map.png.
 *
 * Usage:  npm run sitemap        (dev server must be running on port 5000)
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * puppeteer-core is a heavy, local-only tool dependency. It is deliberately NOT
 * listed in package.json so it never gets installed during the Vercel build.
 * Load it here, installing on demand (without saving to package.json) the first
 * time this script runs in a fresh workspace.
 */
async function loadPuppeteer() {
  try {
    return (await import('puppeteer-core')).default;
  } catch {
    console.log('First run: installing puppeteer-core locally (not saved to package.json)...');
    execSync('npm install puppeteer-core --no-save --no-audit --no-fund', { stdio: 'inherit' });
    return (await import('puppeteer-core')).default;
  }
}

const BASE = process.env.SITEMAP_BASE_URL || 'http://localhost:5000';
const SHOT_DIR = '/tmp/sitemap-shots';
const OUT_DIR = resolve('exports');
const OUT_FILE = resolve(OUT_DIR, 'site-map.png');

/** Site structure. `group: true` = label-only header (no page of its own). */
const TREE = {
  home: { label: 'Home', path: '/' },
  sections: [
    {
      label: 'Products',
      group: true,
      children: [
        { label: 'AmeraKey', path: '/products/amerakey' },
        { label: 'AmeraSecrets', path: '/products/amerasecrets' },
      ],
    },
    {
      label: 'Industry Use Cases',
      path: '/industries',
      cols: 3,
      children: [
        { label: 'Manufacturing', path: '/industries/manufacturing' },
        { label: 'Oil & Gas', path: '/industries/oil-gas' },
        { label: 'Utilities', path: '/industries/utilities' },
        { label: 'Financial Services', path: '/industries/financial-services' },
        { label: 'Government & Defense', path: '/industries/government-and-defense' },
        { label: 'Maritime', path: '/industries/maritime' },
        { label: 'Life Sciences & Healthcare', path: '/industries/life-sciences-and-healthcare' },
        { label: 'Retail', path: '/industries/retail' },
        { label: 'Telecommunications', path: '/industries/telecommunications' },
        { label: 'Transportation', path: '/industries/transportation' },
        { label: 'IT & Agentic AI', path: '/industries/information-technology-agentic-ai' },
        { label: 'IoT', path: '/industries/iot' },
      ],
    },
    { label: 'White Papers', path: '/resources', children: [] },
    { label: 'News', path: '/news', children: [] },
    {
      label: 'Company',
      path: '/company',
      cols: 2,
      children: [
        { label: 'Vision & Mission', path: '/company/vision-and-mission' },
        { label: 'Executive Team', path: '/company/executive-team' },
        { label: 'Board of Advisors', path: '/company/board-of-advisors' },
        { label: 'Patents', path: '/company/patents' },
      ],
    },
    { label: 'Contact Us', path: '/contact', children: [] },
  ],
};

function allPages() {
  const pages = [TREE.home];
  for (const s of TREE.sections) {
    if (s.path) pages.push(s);
    for (const c of s.children || []) pages.push(c);
  }
  return pages;
}

function slugify(p) {
  return p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '__');
}

function findChromium() {
  try {
    return execSync('which chromium', { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('chromium not found on PATH');
  }
}

async function main() {
  // sanity: server reachable?
  try {
    const res = await fetch(BASE, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error(`Cannot reach ${BASE} — start the dev server first (npm run dev).`);
    process.exit(1);
  }

  rmSync(SHOT_DIR, { recursive: true, force: true });
  mkdirSync(SHOT_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({
    executablePath: findChromium(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const pages = allPages();
  for (const p of pages) {
    const url = BASE + p.path;
    process.stdout.write(`  shot  ${p.path} ... `);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // small settle for fonts/images/video first frame
    await new Promise((r) => setTimeout(r, 1500));
    const file = `${SHOT_DIR}/${slugify(p.path)}.png`;
    await page.screenshot({ path: file });
    p.shot = file;
    console.log('ok');
  }

  // ---- compose the tree page ----
  const CARD_W = 200;
  const CARD_H = Math.round((CARD_W * 900) / 1440);

  const cardHtml = (node, id) => `
    <div class="card" id="${id}">
      ${
        node.shot
          ? `<img src="file://${node.shot}" width="${CARD_W}" height="${CARD_H}" alt="">`
          : `<div class="groupbox" style="width:${CARD_W}px">${node.label}</div>`
      }
      ${node.shot ? `<div class="lbl">${node.label}</div>` : ''}
    </div>`;

  let colsHtml = '';
  TREE.sections.forEach((s, i) => {
    const kids = (s.children || [])
      .map((c, j) => cardHtml(c, `s${i}c${j}`))
      .join('');
    const kidsWrap = s.cols
      ? `<div class="kids" style="display:grid;grid-template-columns:repeat(${s.cols}, ${CARD_W}px);gap:26px 18px;">${kids}</div>`
      : `<div class="kids">${kids}</div>`;
    colsHtml += `<div class="col">${cardHtml(s, `s${i}`)}${kidsWrap}</div>`;
  });

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; padding: 40px 50px 60px; position: relative; }
    h1 { font-size: 26px; color: #111; }
    .sub { font-size: 12px; color: #777; margin: 4px 0 30px; }
    .card { display: inline-block; text-align: left; margin: 0; }
    .card img { display: block; border: 1px solid #c9ced6; border-radius: 3px; box-shadow: 0 1px 4px rgba(0,0,0,.12); background: #fff; }
    .lbl { font-size: 11px; font-weight: 700; color: #222; margin-top: 5px; }
    .groupbox { border: 1px solid #c9ced6; border-radius: 3px; background: #eef2f7; color: #1f3a5f; font-weight: 700; font-size: 13px; text-align: center; padding: 14px 8px; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
    #home { display: block; width: ${CARD_W}px; margin: 0 auto 70px; }
    .row { display: flex; justify-content: center; gap: 44px; align-items: flex-start; }
    .col { display: flex; flex-direction: column; gap: 34px; }
    .kids { display: flex; flex-direction: column; gap: 26px; padding-left: 26px; }
    svg.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; }
  </style></head><body>
    <h1>AMERA Website — Visual Site Map</h1>
    <div class="sub">Connected site tree with live page screenshots — generated ${new Date().toISOString().slice(0, 10)}</div>
    ${cardHtml(TREE.home, 'home')}
    <div class="row">${colsHtml}</div>
    <svg class="wires"></svg>
    <script>
      const svg = document.querySelector('svg.wires');
      const NS = 'http://www.w3.org/2000/svg';
      function line(x1, y1, x2, y2) {
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', x1); l.setAttribute('y1', y1);
        l.setAttribute('x2', x2); l.setAttribute('y2', y2);
        l.setAttribute('stroke', '#9aa4b2'); l.setAttribute('stroke-width', '1.5');
        svg.appendChild(l);
      }
      function rect(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, cx: r.left + scrollX + r.width / 2, cy: r.top + scrollY + r.height / 2 };
      }
      window.addEventListener('load', () => {
        const home = rect(document.getElementById('home'));
        const sections = [...document.querySelectorAll('.col > .card')].map(rect);
        const busY = home.y + home.h + 28;
        line(home.cx, home.y + home.h, home.cx, busY);
        const xs = sections.map(s => s.cx);
        line(Math.min(...xs), busY, Math.max(...xs), busY);
        sections.forEach(s => line(s.cx, busY, s.cx, s.y));
        document.querySelectorAll('.col').forEach(col => {
          const parent = rect(col.querySelector(':scope > .card'));
          const kids = [...col.querySelectorAll(':scope .kids .card')].map(rect);
          if (!kids.length) return;
          const spineX = parent.x + 10;
          const lastKid = kids.reduce((a, b) => (b.cy > a.cy ? b : a));
          line(spineX, parent.y + parent.h, spineX, lastKid.cy);
          kids.forEach(k => line(spineX, k.cy, k.x, k.cy));
        });
        window.__ready = true;
      });
    </script>
  </body></html>`;

  const htmlFile = `${SHOT_DIR}/tree.html`;
  writeFileSync(htmlFile, html);

  const tree = await browser.newPage();
  await tree.setViewport({ width: 2350, height: 1200, deviceScaleFactor: 2 });
  await tree.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });
  await tree.waitForFunction('window.__ready === true', { timeout: 15000 });
  await tree.screenshot({ path: OUT_FILE, fullPage: true });

  await browser.close();
  console.log(`\nSite map written to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
