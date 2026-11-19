// latest.json: the newest version of each SSH Panel app package, rebuilt from this repo's published releases (tags app-<system>-vX.Y.Z).
// The apps read it to check for updates (format 1; https://github.com/rivenhere/ssh-panel, docs/releases.md). Run by
// .github/workflows/latest-json.yml after a release is published; node .github/scripts/update-latest.mjs [out-file]
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const out = process.argv[2] || 'latest.json';
const api = (path) => fetch(`https://api.github.com/repos/${repo}${path}`, {
  headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
});

// Which package a file is, by its release name (SSH-Panel-X.Y.Z-linux-amd64.deb, …)
const TARGETS = [
  ['app-windows-setup', (n) => /\.exe$/i.test(n)],
  ['app-windows-msi', (n) => /\.msi$/i.test(n)],
  ['app-windows-portable', (n) => /[-_]portable\.zip$/i.test(n)],
  ['app-linux-deb', (n) => /\.deb$/.test(n)],
  ['app-linux-rpm', (n) => /\.rpm$/.test(n)],
  ['app-linux-appimage', (n) => /\.AppImage$/.test(n)],
  ['app-linux-arch', (n) => /\.pkg\.tar\.zst$/.test(n)],
  ['app-macos-dmg', (n) => /\.dmg$/i.test(n)],
  ['app-android-apk', (n) => /\.apk$/i.test(n)],
];
const targetOf = (n) => (TARGETS.find(([, test]) => test(n)) || [null])[0];
const newer = (a, b) => {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

async function sha256(asset) {
  // GitHub records each asset's SHA-256; older assets without it are downloaded
  if (/^sha256:[0-9a-f]{64}$/.test(asset.digest || '')) return asset.digest.slice(7);
  const r = await fetch(asset.browser_download_url);
  if (!r.ok) throw new Error(`${asset.name}: download answered ${r.status}`);
  return createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex');
}

const releases = [];
for (let page = 1; ; page++) {
  const r = await api(`/releases?per_page=100&page=${page}`);
  if (!r.ok) throw new Error(`the releases answered ${r.status}`);
  const list = await r.json();
  releases.push(...list);
  if (list.length < 100) break;
}

const best = {};
for (const rel of releases) {
  if (rel.draft || rel.prerelease || !/^app-[a-z]+-v\d+\.\d+\.\d+$/.test(rel.tag_name)) continue;
  const tagVersion = rel.tag_name.match(/\d+\.\d+\.\d+$/)[0];
  for (const asset of rel.assets) {
    const target = targetOf(asset.name);
    if (!target) continue;
    const version = (asset.name.match(/\d+\.\d+\.\d+/) || [tagVersion])[0];
    const cur = best[target];
    if (cur && !newer(version, cur.version)) continue;
    best[target] = { version, rel, asset };
  }
}

const targets = {};
for (const [target] of TARGETS) {
  const b = best[target];
  if (!b) continue;
  targets[target] = {
    version: b.version,
    page: b.rel.html_url,
    date: (b.rel.published_at || b.rel.created_at).slice(0, 10),
    file: { name: b.asset.name, url: b.asset.browser_download_url, size: b.asset.size, sha256: await sha256(b.asset) },
  };
}
const index = { format: 1, project: 'ssh-panel', updated: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), targets };
writeFileSync(out, JSON.stringify(index, null, 2) + '\n');
for (const [t, e] of Object.entries(targets)) console.log(`${t} ${e.version}: ${e.file.name}`);
