#!/usr/bin/env node
// One-command publish for the Amera site.
//
//   npm run publish              push code to GitHub + sync changed images to Bunny
//   npm run publish -- --dry-run show what WOULD happen, change nothing
//   npm run publish -- --skip-media   only push code to GitHub
//   npm run publish -- --skip-git     only sync images to Bunny
//   npm run publish -- --prune        also delete files removed locally from BOTH
//                                     GitHub and the Bunny CDN storage zone
//   npm run publish -- --force        publish even if GitHub changed outside this workspace
//
// Nothing in this repo goes live until you run this. Editing + previewing
// locally never touches GitHub or Bunny.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const SKIP_MEDIA = args.includes('--skip-media');
const SKIP_GIT = args.includes('--skip-git');
const PRUNE = args.includes('--prune');
const FORCE = args.includes('--force');

// ---- config --------------------------------------------------------------
const GH_OWNER = 'amera-iot';
const GH_REPO = 'amera_iot_replit_website';
const GH_BRANCH = 'main';

const BUNNY_ZONE = 'amera-media';
const BUNNY_STORAGE_HOST = 'storage.bunnycdn.com';
const CDN_BASE = process.env.ASSET_CDN_BASE || 'https://ameraiot.b-cdn.net';
const ASSETS_DIR = 'public/assets';
const REMOTE_PREFIX = 'assets';

const ghToken = process.env.GITHUB_TOKEN;
const storageKey = process.env.BUNNY_STORAGE_PASSWORD;
const accountKey = process.env.BUNNY_ACCOUNT_API_KEY;

// Remembers the GitHub commit we last published, so we can warn if the repo was
// changed elsewhere before overwriting it. Lives in gitignored .local/.
const STATE_FILE = '.local/publish-state.json';
const readState = () => { try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); } catch { return {}; } };
const writeState = (s) => { try { mkdirSync('.local', { recursive: true }); writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); } catch { /* non-fatal */ } };

// ---- tiny helpers --------------------------------------------------------
const log = (...a) => console.log(...a);
const die = (msg) => { console.error(`\n  ERROR: ${msg}\n`); process.exit(1); };
const sha256Upper = (buf) => createHash('sha256').update(buf).digest('hex').toUpperCase();
const gitBlobSha = (buf) => {
  const h = createHash('sha1');
  h.update(`blob ${buf.length}\0`);
  h.update(buf);
  return h.digest('hex');
};

const CONTENT_TYPES = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.avif': 'image/avif', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.mov': 'video/quicktime', '.pdf': 'application/pdf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.json': 'application/json', '.txt': 'text/plain',
};
const contentType = (p) => CONTENT_TYPES[extname(p).toLowerCase()] || 'application/octet-stream';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

async function chunked(items, size, fn) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

// ---- Bunny media sync ----------------------------------------------------
// Bunny storage occasionally returns transient 401/429/5xx under load, so wrap
// each request in a short retry with backoff before giving up.
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const RETRY_STATUS = new Set([401, 408, 429, 500, 502, 503, 504]);

async function bunnyFetch(url, opts = {}, { attempts = 4 } = {}) {
  let last;
  for (let i = 1; i <= attempts; i++) {
    try {
      const r = await fetch(url, opts);
      if (r.ok || r.status === 404 || !RETRY_STATUS.has(r.status)) return r;
      last = `HTTP ${r.status}`;
    } catch (e) {
      last = e.message;
    }
    if (i < attempts) {
      const wait = 500 * 2 ** (i - 1); // 0.5s, 1s, 2s
      log(`    (Bunny ${last}; retrying in ${wait / 1000}s — ${i}/${attempts - 1})`);
      await sleep(wait);
    }
  }
  return { ok: false, status: 0, _error: last };
}

async function listBunny(dirPath, map) {
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_ZONE}/${dirPath}/`;
  const r = await bunnyFetch(url, { headers: { AccessKey: storageKey, Accept: 'application/json' } });
  if (r.status === 404) return map; // folder doesn't exist yet
  if (!r.ok) die(`Bunny listing failed for /${dirPath} (${r._error || 'HTTP ' + r.status}). If this keeps happening, check BUNNY_STORAGE_PASSWORD.`);
  for (const it of await r.json()) {
    const rel = `${dirPath}/${it.ObjectName}`;
    if (it.IsDirectory) await listBunny(rel, map);
    else map.set(rel, (it.Checksum || '').toUpperCase());
  }
  return map;
}

async function uploadBunny(localFile, remotePath) {
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_ZONE}/${remotePath}`;
  const r = await bunnyFetch(url, {
    method: 'PUT',
    headers: { AccessKey: storageKey, 'Content-Type': contentType(localFile) },
    body: readFileSync(localFile),
  });
  if (!r.ok) die(`Upload failed for ${remotePath} (${r._error || 'HTTP ' + r.status}).`);
}

async function deleteBunny(remotePath) {
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_ZONE}/${remotePath}`;
  const r = await bunnyFetch(url, { method: 'DELETE', headers: { AccessKey: storageKey } });
  // A 404 means it's already gone — treat that as success.
  if (!r.ok && r.status !== 404) die(`Delete failed for ${remotePath} (${r._error || 'HTTP ' + r.status}).`);
}

async function purgeBunny(url) {
  if (!accountKey) return false;
  const r = await fetch(`https://api.bunny.net/purge?url=${encodeURIComponent(url)}&async=false`, {
    method: 'POST',
    headers: { AccessKey: accountKey },
  });
  return r.ok;
}

async function syncMedia() {
  log('\n— Images → Bunny CDN —');
  if (!storageKey) die('Missing BUNNY_STORAGE_PASSWORD.');
  if (!existsSync(ASSETS_DIR)) { log('  No public/assets folder; nothing to sync.'); return; }

  const remote = await listBunny(REMOTE_PREFIX, new Map());
  const localFiles = walk(ASSETS_DIR);

  const localRemotePaths = new Set();
  const toUpload = []; // { localFile, remotePath, changed }
  for (const localFile of localFiles) {
    const rel = localFile.slice(ASSETS_DIR.length + 1).split('\\').join('/');
    const remotePath = `${REMOTE_PREFIX}/${rel}`;
    localRemotePaths.add(remotePath);
    const local = sha256Upper(readFileSync(localFile));
    const remoteSum = remote.get(remotePath);
    if (remoteSum === undefined) toUpload.push({ localFile, remotePath, changed: false });
    else if (remoteSum !== local) toUpload.push({ localFile, remotePath, changed: true });
  }

  // Orphans = files on Bunny under assets/ that no longer exist locally.
  const orphans = [...remote.keys()].filter((k) => !localRemotePaths.has(k));

  const added = toUpload.filter((f) => !f.changed);
  const changed = toUpload.filter((f) => f.changed);

  if (!toUpload.length) {
    log('  Up to date — no image changes.');
  } else {
    log(`  ${added.length} new, ${changed.length} changed.`);
    for (const f of toUpload) log(`    ${f.changed ? 'changed' : 'new    '}  ${f.remotePath}`);

    if (DRY) { log('  (dry run — not uploading)'); }
    else {
      await chunked(toUpload, 8, (f) => uploadBunny(f.localFile, f.remotePath));
      log('  Uploaded.');
    }

    // Same-name changes are cached at the CDN edge; try to clear them.
    if (changed.length && !DRY) {
      const stillCached = [];
      for (const f of changed) {
        const ok = await purgeBunny(`${CDN_BASE}/${f.remotePath}`);
        if (!ok) stillCached.push(f.remotePath);
      }
      if (stillCached.length) {
        log('\n  NOTE: these reused filenames may show the OLD image for up to 30 days');
        log('  (the CDN cache could not be cleared automatically):');
        for (const p of stillCached) log(`    ${p}`);
        log('  To force the new version immediately, give the file a new name (e.g. add -v2).');
      }
    }
  }

  // Orphan cleanup mirrors the GitHub --prune behavior: only removes files when
  // --prune is set, and only ever lists them under --dry-run.
  if (orphans.length) {
    if (PRUNE) {
      log(`  ${orphans.length} orphan(s) on Bunny CDN (no local match):`);
      for (const p of orphans) log(`    delete  ${p}`);
      if (DRY) {
        log('  (dry run — not deleting)');
      } else {
        await chunked(orphans, 8, (p) => deleteBunny(p));
        log(`  ${orphans.length} removed from CDN.`);
      }
    } else {
      log(`  ${orphans.length} file(s) on Bunny CDN have no local match; run with --prune to remove them.`);
    }
  }
}

// ---- GitHub code push (REST Git Data API, no git push needed) -------------
async function gh(path, opts = {}) {
  const r = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}${path}`, {
    headers: {
      Authorization: `Bearer ${ghToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    ...opts,
  });
  const text = await r.text();
  if (!r.ok) die(`GitHub ${opts.method || 'GET'} ${path} -> ${r.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

async function pushCode() {
  log('\n— Code → GitHub —');
  if (!ghToken) die('Missing GITHUB_TOKEN.');

  // All files to publish = tracked files that still exist on disk + new
  // (untracked, non-ignored) files. .gitignore is respected, so public/assets,
  // .local, .agents, node_modules, etc. are excluded automatically.
  const parseLsTracked = (line) => {
    const tab = line.indexOf('\t');
    const path = line.slice(tab + 1);
    const mode = line.slice(0, tab).split(' ')[0];
    return { path, mode };
  };
  const modeFor = (p) => ((statSync(p).mode & 0o111) ? '100755' : '100644');

  const tracked = execSync('git ls-files -s', { encoding: 'utf8' })
    .split('\n').filter(Boolean).map(parseLsTracked);
  const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .map((path) => ({ path, mode: modeFor(path) }));

  const localFiles = [];
  const localPaths = new Set();
  for (const f of [...tracked, ...untracked]) {
    if (!existsSync(f.path)) continue; // tracked-but-deleted files are handled as deletions below
    localFiles.push(f);
    localPaths.add(f.path);
  }

  // Current remote state.
  const ref = await gh(`/git/ref/heads/${GH_BRANCH}`);
  const baseCommitSha = ref.object.sha;

  // Safety: refuse to overwrite GitHub if it moved since our last publish from
  // here (e.g. someone edited the repo directly). --force overrides.
  const state = readState();
  if (state.lastRemoteSha && state.lastRemoteSha !== baseCommitSha && !FORCE) {
    const msg =
      `GitHub has changed since your last publish from here.\n` +
      `  Last published: ${state.lastRemoteSha.slice(0, 7)}   GitHub now: ${baseCommitSha.slice(0, 7)}\n` +
      `  Someone or something updated the repo outside this workspace.\n` +
      `  To publish anyway and overwrite those changes with your local version, run:\n` +
      `      npm run publish -- --force`;
    if (DRY) log(`  WARNING: ${msg}`);
    else die(msg);
  }

  const baseCommit = await gh(`/git/commits/${baseCommitSha}`);
  const baseTreeSha = baseCommit.tree.sha;
  const remoteTree = await gh(`/git/trees/${baseTreeSha}?recursive=1`);
  const remoteBlobs = new Map(
    remoteTree.tree.filter((e) => e.type === 'blob').map((e) => [e.path, e.sha]),
  );

  // What changed locally vs GitHub.
  const upserts = [];
  for (const { path, mode } of localFiles) {
    const buf = readFileSync(path);
    if (remoteBlobs.get(path) !== gitBlobSha(buf)) upserts.push({ path, mode, buf });
  }
  const deletes = PRUNE ? [...remoteBlobs.keys()].filter((p) => !localPaths.has(p)) : [];
  const removedButNotPruned = !PRUNE
    ? [...remoteBlobs.keys()].filter((p) => !localPaths.has(p))
    : [];

  if (!upserts.length && !deletes.length) {
    log('  Up to date — no code changes.');
    if (removedButNotPruned.length) {
      log(`  (${removedButNotPruned.length} file(s) you deleted locally are still on GitHub; run with --prune to remove them.)`);
    }
    if (!DRY) writeState({ lastRemoteSha: baseCommitSha, lastPublishedAt: new Date().toISOString() });
    return;
  }
  log(`  ${upserts.length} file(s) to update${PRUNE ? `, ${deletes.length} to delete` : ''}:`);
  for (const u of upserts) log(`    update  ${u.path}`);
  for (const d of deletes) log(`    delete  ${d}`);

  if (DRY) { log('  (dry run — not pushing)'); return; }

  // Create blobs for changed files.
  await chunked(upserts, 12, async (u) => {
    const blob = await gh('/git/blobs', {
      method: 'POST',
      body: JSON.stringify({ content: u.buf.toString('base64'), encoding: 'base64' }),
    });
    u.sha = blob.sha;
  });

  const entries = [
    ...upserts.map((u) => ({ path: u.path, mode: u.mode, type: 'blob', sha: u.sha })),
    ...deletes.map((p) => ({ path: p, mode: '100644', type: 'blob', sha: null })),
  ];

  // Build tree(s) on top of the remote tree, chunking to stay within API limits.
  let treeSha = baseTreeSha;
  for (let i = 0; i < entries.length; i += 40) {
    const tree = await gh('/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: treeSha, tree: entries.slice(i, i + 40) }),
    });
    treeSha = tree.sha;
  }

  const commit = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message: `Publish: site update (${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)`,
      tree: treeSha,
      parents: [baseCommitSha],
    }),
  });
  await gh(`/git/refs/heads/${GH_BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });
  writeState({ lastRemoteSha: commit.sha, lastPublishedAt: new Date().toISOString() });
  log(`  Pushed commit ${commit.sha.slice(0, 7)} to ${GH_BRANCH}. Vercel will deploy automatically.`);
}

// ---- run -----------------------------------------------------------------
(async () => {
  log(DRY ? '\nPUBLISH (dry run — nothing will change)' : '\nPUBLISH');
  if (!SKIP_MEDIA) await syncMedia();
  if (!SKIP_GIT) await pushCode();
  log('\nDone.\n');
})().catch((e) => die(e?.message || String(e)));
