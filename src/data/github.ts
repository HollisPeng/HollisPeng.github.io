import { featuredProjects } from './profile.ts';

export type Repository = {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  updatedAt: string;
};
export type Snapshot = { repositories: Repository[] | null; featured: Repository[] };

export const apiUrl = 'https://api.github.com/users/HollisPeng/repos?type=owner&sort=updated&direction=desc&per_page=100';
export const apiHeaders = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' };
const excluded = new Set(['hollispeng.github.io', ...featuredProjects.map(project => project.repository.toLowerCase())]);
const optionalText = (value: unknown): value is string | null => value === null || typeof value === 'string';

export function isRepository(value: unknown): value is Repository {
  if (!value || typeof value !== 'object') return false;
  const r = value as Repository;
  return typeof r.name === 'string' && /^[\w.-]+$/.test(r.name)
    && r.url === `https://github.com/HollisPeng/${r.name}`
    && optionalText(r.description) && optionalText(r.language)
    && Number.isInteger(r.stars) && r.stars >= 0
    && typeof r.updatedAt === 'string' && Number.isFinite(Date.parse(r.updatedAt));
}

export function normalizeRepositories(data: unknown): Repository[] {
  if (!Array.isArray(data)) throw new Error('Invalid GitHub response');
  return data.flatMap((r): Repository[] => {
    if (!r || typeof r !== 'object') throw new Error('Invalid repository');
    if (r.fork === true || r.archived === true || r.disabled === true || r.private === true) return [];
    if (r.fork !== false || r.archived !== false || r.disabled !== false || r.private !== false || r.owner?.login?.toLowerCase() !== 'hollispeng') throw new Error('Invalid repository visibility or owner');
    const normalized = { name: r.name, url: r.html_url, description: r.description, language: r.language, stars: r.stargazers_count, updatedAt: r.updated_at };
    if (!isRepository(normalized)) throw new Error('Invalid repository fields');
    return [normalized];
  }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function additionalRepositories(repositories: Repository[]): Repository[] {
  return repositories.filter(r => !excluded.has(r.name.toLowerCase())).slice(0, 6);
}

export function readSnapshot(data: unknown): Snapshot {
  if (!data || typeof data !== 'object') return { repositories: null, featured: [] };
  const s = data as Snapshot;
  return {
    repositories: Array.isArray(s.repositories) && s.repositories.every(isRepository) ? additionalRepositories(s.repositories) : null,
    featured: Array.isArray(s.featured) && s.featured.every(isRepository) ? s.featured : [],
  };
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}
