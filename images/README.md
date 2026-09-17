# Images

Drop photos and videos here. The site picks them up automatically and resizes and compresses them when it builds, so full-size originals are fine.

```
images/
  studio/
    portrait.jpg              ← Rufus Kerr portrait (home + studio pages)
  projects/
    the-rise/                 ← one folder per project, named to match
    lifesource/                  src/content/projects/<name>.md
    ...
```

## Project photos and videos

- Formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, and `.mp4` / `.webm` for video.
- Images show in **filename order**, so number them: `01 street.jpg`, `02 lobby.jpg`, …
- Layout is automatic. Big landscape images go full width, upright and smaller images sit in pairs, and videos play full width on loop. Files under ~1100px wide are never stretched across the screen, so larger originals give you bigger images.
- Click any image on the site to open it full screen.

## Choosing the lead image, hiding files, captions

These go in the project's Markdown file (`src/content/projects/<name>.md`), between the `---` lines:

```yaml
cover: "Malaysia 03.jpeg"          # full-screen image at the top of the page, and on the home page reel
exclude:                           # files in the folder to leave off the site
  - "Malaysia 21.jpg"
captions:                          # optional captions under images
  "Interior Entry View.jpg": "Entry"
```

Without `cover`, the first landscape image is used.

## Portrait

Save as `images/studio/portrait.jpg` (or `.png` / `.webp`). A 4:5 portrait crop looks best.
