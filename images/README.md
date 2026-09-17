# Images

Drop photos here. The site picks them up automatically and resizes and compresses them at build time, so full-size originals are fine.

```
images/
  studio/
    portrait.jpg              ← Rufus Kerr portrait (home + studio pages)
  projects/
    monolith-house/           ← one folder per project, named to match
    lantern-tower/               src/content/projects/<name>.md
    ...
```

## Project photos

- Put them in `images/projects/<project-name>/`.
- **They show in filename order**, so number them: `01-street-view.jpg`, `02-living-room.jpg`, …
- The filename becomes the caption and alt text: `03-north-facade-at-dusk.jpg` → "North facade at dusk".
- Every third photo (1st, 4th, 7th…) is shown full width; the rest sit in pairs.
- Formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.

## New project

Create the Markdown file in `src/content/projects/` first (e.g. `beach-house.md`), then make a matching folder `images/projects/beach-house/`.

## Portrait

Save as `images/studio/portrait.jpg` (or `.png` / `.webp`). A 4:5 portrait crop looks best. It's shown in greyscale.
