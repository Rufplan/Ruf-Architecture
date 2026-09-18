# Ruf Architecture

Portfolio website for **Ruf Architecture** — Rufus Kerr, Principal.

Built with [Astro](https://astro.build) (static output) and [Three.js](https://threejs.org). A heavy black-and-white design where each project is built up from the ground in 3D from its own photography.

## Commands

```sh
npm install      # install dependencies
npm run dev      # dev server at http://localhost:4321
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  site.config.ts          Studio name, principal, contact details  ← edit first
  content.config.ts       Project schema
  data/experience.ts      Firms, roles, dates, role descriptions, skills
  content/projects/*.md   One Markdown file per project
  scripts/assemble.ts     Three.js engine: builds each cover photo up from the ground in 3D
  layouts/Base.astro      HTML shell, intro loader, cursor, grain, reveals
  components/             Header, Footer, WorkList (hover previews), Marquee
  pages/
    index.astro           Home: 3D build-up hero, statement, image reel, work list, principal
    work/index.astro      Project index grid
    work/[slug].astro     Project page: 3D build-up of the cover photo, text, gallery, lightbox
    studio.astro          Studio / principal / principles
images/                   Drop project photos + portrait here (auto-optimised)
public/                   Static files (favicon)
```

## Adding a project

1. If it was at a new firm, add the role to `src/data/experience.ts`.
2. Create `src/content/projects/my-project.md`:

```md
---
title: "My Project"
experience: arg          # key from src/data/experience.ts
location: "City, State"
years: "2025–2026"
year: 2026               # for sorting, most recent first
typology: "Commercial"   # becomes a filter on /work
featured: true           # show on the home page
---

Optional project narrative in Markdown. The role description from experience.ts is shown automatically.
```

3. Drop photos into `images/projects/my-project/`. They're picked up automatically, ordered by filename, captioned from the filename and optimised at build time. See [images/README.md](images/README.md). Photos are shown in greyscale to keep the black-and-white look; remove `filter: grayscale(1)` in `work/[slug].astro` to show them in colour.

## Before launch

- The domain in `astro.config.mjs` (`rufarchitecture.com`) is a guess — set it to the real one before launch.
- Add photos and a portrait (`images/studio/portrait.jpg`).
- Projects are credited to the firm and role they were done under.
## Deploy

The build is fully static (`dist/`). Deploy to Cloudflare Pages, Netlify or Vercel: build command `npm run build`, output directory `dist`.
