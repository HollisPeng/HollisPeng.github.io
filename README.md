# Hollis Peng

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Personal homepage · **https://hollispeng.github.io/**

Built with Astro, TypeScript, native CSS, and self-hosted Newsreader and Inter fonts. Static HTML with a small GitHub repository refresh script; no analytics or client framework.

## Development

Use the Node.js version in `.node-version`.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run preview
```

Edit `src/data/profile.ts` for personal details, navigation, featured projects, and ordered skills. Featured projects are listed in display order; set `owner` for a repository that belongs to someone else, and omit `repository` to describe non-public work without a link. Edit `src/styles/global.css` for the visual design. The hero illustration in `src/components/EnergyLandscape.astro` is a static, generated SVG.

## Project synchronization

`npm run build` retrieves public owner repositories and updates `src/data/github-projects.json`. Forks, archived and disabled repositories, this homepage, and featured projects are excluded from the additional list. At most six projects appear, newest first. Featured projects owned by this account use verified repository metadata; contributions to other repositories use the labels in `profile.ts`.

The page includes this snapshot in its initial HTML and attempts one unauthenticated refresh when the repository section approaches the viewport. Failed, invalid, rate-limited, or timed-out requests retain the bundled snapshot. Missing snapshots display a short fallback link, and an empty list leaves only the heading row linking to GitHub. No browser token is required or included.

## Deployment

GitHub Pages uses the GitHub Actions source. Pushes to `main`, manual workflow runs, and daily runs at 04:23 UTC build and deploy the site. Scheduled refreshes update the deployed snapshot without making content commits. Dependencies are locked and Node.js is pinned.

## License

MIT © Hollis Peng. Personal names, biography text, and branding do not imply endorsement of derivative sites. Newsreader and Inter are distributed under the SIL Open Font License; notices are included in `public/fonts/`.
