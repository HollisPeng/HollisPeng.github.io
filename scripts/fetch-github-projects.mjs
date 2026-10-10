import { readFile, writeFile } from 'node:fs/promises';
import { apiUrl, apiHeaders, normalizeRepositories, additionalRepositories, readSnapshot, ownFeatured } from '../src/data/github.ts';

const destination = new URL('../src/data/github-projects.json', import.meta.url);
try {
  const headers = { ...apiHeaders };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(apiUrl, { headers, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const all = normalizeRepositories(await response.json());
  const snapshot = {
    repositories: additionalRepositories(all),
    featured: all.filter(r => ownFeatured.includes(r.name)),
  };
  await writeFile(destination, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`GitHub snapshot: ${snapshot.featured.length} featured, ${snapshot.repositories.length} additional.`);
} catch {
  let snapshot = { repositories: null, featured: [] };
  try { snapshot = readSnapshot(JSON.parse(await readFile(destination, 'utf8'))); } catch { /* Render the unavailable state when no snapshot exists. */ }
  await writeFile(destination, JSON.stringify(snapshot, null, 2) + '\n');
  console.warn('GitHub refresh unavailable; using the bundled snapshot.');
}
