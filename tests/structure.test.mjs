import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

test('preserves public/share directory and shared files for static link hosting', async () => {
  const shareDir = await stat(path.join(root, 'public', 'share'));
  assert.equal(shareDir.isDirectory(), true);

  const sharedFile = await stat(
    path.join(root, 'public', 'share', 'cuhk-literary-map-moon.jpg'),
  );
  assert.equal(sharedFile.isFile(), true);
  assert.ok(sharedFile.size > 0);
});

test('maintains organized source, style, script, and test directories', async () => {
  const requiredPaths = [
    'src/components/layout/SiteHeader.astro',
    'src/components/layout/SiteFooter.astro',
    'src/components/home/EnergyLandscape.astro',
    'src/components/home/RepositoryList.astro',
    'src/components/models/FrontierFigure.astro',
    'src/data/profile.ts',
    'src/data/frontier-models.ts',
    'src/data/github-projects.json',
    'src/lib/frontier.ts',
    'src/lib/github.ts',
    'src/scripts/github-projects.ts',
    'src/scripts/theme.ts',
    'src/styles/tokens.css',
    'src/styles/base.css',
    'src/styles/home.css',
    'src/styles/models.css',
    'src/styles/global.css',
    'scripts/sync-github-projects.mjs',
  ];

  for (const rel of requiredPaths) {
    const info = await stat(path.join(root, rel));
    assert.equal(info.isFile(), true, `Expected file ${rel} to exist`);
  }
});
