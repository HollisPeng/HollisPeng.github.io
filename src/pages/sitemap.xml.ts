import type { APIRoute } from 'astro';
import { navigation } from '../data/profile';

const paths = ['/', ...navigation.map(item => item.href).filter(href => href.startsWith('/') && !href.includes('#'))];

export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${new URL(path, site)}</loc></url>`).join('')}</urlset>`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
