import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRepositories, additionalRepositories, readSnapshot } from '../src/data/github.ts';

const repo = (name, extra = {}) => ({ name, html_url: `https://github.com/HollisPeng/${name}`, description: null, language: null, stargazers_count: 0, updated_at: '2026-09-12T00:00:00Z', private: false, fork: false, archived: false, disabled: false, owner: { login: 'HollisPeng' }, ...extra });

test('excludes non-public, forked, archived, disabled, featured and homepage repositories', () => {
  const data = [repo('visible'), repo('fork', { fork: true }), repo('archive', { archived: true }), repo('disabled', { disabled: true }), repo('private', { private: true }), repo('cumcm-2026-a-herbal-drying'), repo('ncurses-maze-game'), repo('HollisPeng.github.io')];
  assert.deepEqual(additionalRepositories(normalizeRepositories(data)).map(r => r.name), ['visible']);
});
test('sorts by latest update and limits to six while allowing missing description and language', () => {
  const result = additionalRepositories(normalizeRepositories(Array.from({ length: 9 }, (_, i) => repo(`project-${i}`, { updated_at: `2026-09-0${i + 1}T00:00:00Z` }))));
  assert.equal(result.length, 6);
  assert.equal(result[0].name, 'project-8');
  assert.equal(result[0].description, null);
});
test('rejects malformed responses and unsafe URLs so the existing snapshot can remain visible', () => {
  for (const invalid of [{ message: 'rate limited' }, [null], [repo('x', { html_url: 'javascript:alert(1)' })], [repo('x', { updated_at: 'invalid' })], [repo('x', { stargazers_count: -1 })], [repo('x', { owner: { login: 'someone-else' } })]]) {
    assert.throws(() => normalizeRepositories(invalid));
  }
});
test('distinguishes a valid empty snapshot from an unavailable or corrupt snapshot', () => {
  assert.deepEqual(readSnapshot({ repositories: [], featured: [] }).repositories, []);
  assert.equal(readSnapshot(null).repositories, null);
  assert.equal(readSnapshot({ repositories: [{}], featured: [] }).repositories, null);
});
