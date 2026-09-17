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
  content/projects/*.md   One Markdown file per project           ← placeholder samples
  scripts/massing.ts      Three.js engine: procedural models, live scenes, snapshot renderer
  layouts/Base.astro      HTML shell, intro loader, cursor, grain, reveals
  components/             Header, Footer, WorkList (hover previews), Marquee
  pages/
    index.astro           Home: exploding hero model, statement, work list, principal
    work/index.astro      Project index grid
    work/[slug].astro     Project page: interactive model, text, generated drawing set, gallery
    studio.astro          Studio / principal / principles
public/                   Static files (favicon, project images)
```

## Adding a project

Create `src/content/projects/my-project.md`:

```md
---
title: "My Project"
order: 7                 # position in lists
year: 2026
location: "City, Country"
typology: "Residential"
status: "Completed"
area: "300 m²"
summary: "One-sentence description."
form: tower              # tower | slab | courtyard | cantilever | terrace | cluster
seed: 12                 # change to vary the generated massing
gallery:
  - src: /images/my-project/01.jpg
    alt: "Street view at dusk"
    caption: "Street view"
credits:
  - role: Principal
    name: Rufus Kerr
---

Project narrative in Markdown.
```

Put images in `public/images/<project>/`. Gallery photos are shown in greyscale to keep the black-and-white look. Remove `filter: grayscale(1)` in `work/[slug].astro` to show them in colour.

## Before launch

- The six projects in `src/content/projects/` are **placeholder samples**. Replace or delete them.
- Update contact details in `src/site.config.ts` and the domain in `astro.config.mjs`.
- Replace the placeholder biography and principles in `src/pages/studio.astro` and the portrait placeholders.

## Deploy

The build is fully static (`dist/`). Deploy to Cloudflare Pages, Netlify or Vercel: build command `npm run build`, output directory `dist`.
