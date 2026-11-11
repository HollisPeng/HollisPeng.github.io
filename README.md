# Hollis Peng

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Personal homepage & AI capability frontier tracker · **https://hollispeng.github.io/**

Built with Astro, TypeScript, modular Google Material 3 CSS, and self-hosted Inter Variable fonts. Static HTML with an interactive SVG benchmark visualization and a lightweight GitHub repository refresh script; no analytics or heavy client framework.

## Repository Structure

```text
├── .github/workflows/deploy.yml       # GitHub Pages CI/CD pipeline
├── public/
│   ├── fonts/Inter-OFL.txt            # SIL Open Font License notice
│   ├── share/                         # Shared static files (preserved at /share/*)
│   ├── favicon.svg                    # Google-style 4-color icon
│   └── robots.txt                     # Crawler directives & sitemap
├── scripts/
│   └── sync-github-projects.mjs       # Build-time GitHub snapshot synchronization
├── src/
│   ├── components/
│   │   ├── home/                      # Homepage figures & repository cards
│   │   ├── layout/                    # Google Material 3 header & footer
│   │   └── models/                    # Interactive AI frontier chart & lab cards
│   ├── data/
│   │   ├── frontier-models.ts         # GPQA Diamond dataset (8 AI labs, 79 models)
│   │   ├── github-projects.json       # Bundled GitHub repository snapshot
│   │   └── profile.ts                 # Personal profile, featured work, and skills
│   ├── layouts/
│   │   └── BaseLayout.astro           # Shared document shell & metadata
│   ├── lib/
│   │   ├── frontier.ts                # Frontier calculation, polyline paths, and validation
│   │   └── github.ts                  # GitHub API normalization and snapshot logic
│   ├── pages/
│   │   ├── index.astro                # Personal homepage
│   │   ├── models.astro               # AI Language Model Frontier (/models)
│   │   └── sitemap.xml.ts             # Dynamic XML sitemap
│   ├── scripts/
│   │   └── github-projects.ts         # Client-side viewport repository refresh
│   └── styles/
│       ├── tokens.css                 # Google Material 3 design tokens
│       ├── base.css                   # Layout shell, header, footer, buttons, chips
│       ├── home.css                   # Homepage sections & scientific contour card
│       ├── models.css                 # Frontier chart, interactive filters, lab cards
│       └── global.css                 # Stylesheet entry point
└── tests/
    ├── frontier.test.mjs              # Frontier data & polyline path unit tests
    ├── github.test.mjs                # GitHub normalization unit tests
    └── structure.test.mjs             # Repository layout & public/share integrity tests
```

## Development

Use the Node.js version specified in `.node-version`.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run preview
```

- Edit `src/data/profile.ts` for personal details, navigation, featured projects, and ordered skills.
- Edit `src/data/frontier-models.ts` to add or update AI laboratories, benchmark scores, and milestone events on `/models`.
- Static files placed in `public/share/` are published directly under `https://hollispeng.github.io/share/`.

## Deployment

GitHub Pages uses the GitHub Actions workflow in `.github/workflows/deploy.yml`. Pushes to `main`, manual runs, and daily scheduled runs at 04:23 UTC run type checks, unit tests, repository synchronization, and static build deployment.

## License

MIT © Hollis Peng. Inter is distributed under the SIL Open Font License (`public/fonts/Inter-OFL.txt`).
