# Ruf Architecture

Portfolio website for **Ruf Architecture** — Rufus Kerr, Principal.

Built with [Astro](https://astro.build) (static output) and [Three.js](https://threejs.org). A heavy black-and-white design with procedural architectural massing models drawn live in WebGL.

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
  scripts/massing.ts      Three.js engine: procedural models, live scenes, snapshot renderer
  layouts/Base.astro      HTML shell, intro loader, cursor, grain, reveals
  components/             Header, Footer, WorkList (hover previews), Marquee
  pages/
    index.astro           Home: exploding hero model, statement, work list, principal
    work/index.astro      Project index grid
    work/[slug].astro     Project page: interactive model, text, generated drawing set, gallery
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
form: tower              # abstract diagram: tower | slab | courtyard | cantilever | terrace | cluster
seed: 12                 # change to vary the diagram
---

Optional project narrative in Markdown. The role description from experience.ts is shown automatically.
```

3. Drop photos into `images/projects/my-project/`. They're picked up automatically, ordered by filename, captioned from the filename and optimised at build time. See [images/README.md](images/README.md). Photos are shown in greyscale to keep the black-and-white look; remove `filter: grayscale(1)` in `work/[slug].astro` to show them in colour.

## Before launch

- Contact email and phone in `src/site.config.ts` are placeholders; the domain in `astro.config.mjs` is a guess.
- Add photos and a portrait (`images/studio/portrait.jpg`).
- Projects are credited to the firm and role they were done under. The 3D graphics are labelled as abstract massing diagrams, not drawings of the actual buildings.
## Deploy

The build is fully static (`dist/`). Deploy to Cloudflare Pages, Netlify or Vercel: build command `npm run build`, output directory `dist`.
