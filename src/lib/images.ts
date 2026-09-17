import type { ImageMetadata } from 'astro';

// Everything under /images is imported at build time so Astro can optimise images
// and fingerprint videos.
const imageFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/images/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);
const videoFiles = import.meta.glob<string>('/images/**/*.{mp4,webm,MP4,WEBM}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export type Media =
  | { kind: 'image'; file: string; src: ImageMetadata; ratio: number; caption?: string }
  | { kind: 'video'; file: string; src: string; ratio: number; caption?: string };

const fileName = (path: string) => path.split('/').pop()!;

function inFolder<T>(files: Record<string, T>, folder: string) {
  return Object.entries(files)
    .filter(([path]) => path.startsWith(`/images/${folder}/`))
    .sort(([a], [b]) => fileName(a).localeCompare(fileName(b), undefined, { numeric: true }));
}

interface MediaOptions {
  exclude?: string[];
  captions?: Record<string, string>;
}

/** Images and videos in images/projects/<slug>/, in filename order. */
export function projectMedia(slug: string, { exclude = [], captions = {} }: MediaOptions = {}): Media[] {
  const skip = new Set(exclude);
  const images: Media[] = inFolder(imageFiles, `projects/${slug}`)
    .filter(([path]) => !skip.has(fileName(path)))
    .map(([path, mod]) => ({
      kind: 'image',
      file: fileName(path),
      src: mod.default,
      ratio: mod.default.width / mod.default.height,
      caption: captions[fileName(path)],
    }));
  const videos: Media[] = inFolder(videoFiles, `projects/${slug}`)
    .filter(([path]) => !skip.has(fileName(path)))
    .map(([path, url]) => ({ kind: 'video', file: fileName(path), src: url, ratio: 16 / 9, caption: captions[fileName(path)] }));
  // Videos go after the stills they belong with.
  return [...images, ...videos];
}

/** The lead image: the named cover file, or the first landscape image. */
export function projectCover(media: Media[], cover?: string) {
  const images = media.filter((m): m is Extract<Media, { kind: 'image' }> => m.kind === 'image');
  return (cover && images.find((m) => m.file === cover)) || images.find((m) => m.ratio >= 1.2) || images[0];
}

export function portrait(): ImageMetadata | undefined {
  return inFolder(imageFiles, 'studio').find(([path]) => /\/portrait\.[a-z]+$/i.test(path))?.[1].default;
}
