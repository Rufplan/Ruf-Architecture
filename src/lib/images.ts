import type { ImageMetadata } from 'astro';

// Every image under /images is imported at build time so Astro can optimise it.
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/images/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

export interface FolderImage {
  src: ImageMetadata;
  alt: string;
}

/** "03-north-facade_at-dusk.jpg" → "North facade at dusk" */
function labelFromFilename(path: string) {
  const name = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  const words = name.replace(/^[\d\s._-]+/, '').replace(/[-_]+/g, ' ').trim();
  return words ? words[0].toUpperCase() + words.slice(1) : '';
}

function inFolder(folder: string) {
  return Object.entries(files)
    .filter(([path]) => path.startsWith(`/images/${folder}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
}

export function projectImages(slug: string): FolderImage[] {
  return inFolder(`projects/${slug}`).map(([path, mod]) => ({ src: mod.default, alt: labelFromFilename(path) }));
}

export function portrait(): ImageMetadata | undefined {
  return inFolder('studio').find(([path]) => /\/portrait\.[a-z]+$/i.test(path))?.[1].default;
}
