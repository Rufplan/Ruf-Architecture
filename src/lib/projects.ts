import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { roleByKey } from '../data/experience';
import { projectCover, projectMedia } from './images';

export type Project = CollectionEntry<'projects'>;

/** All projects, most recent first. */
export async function getProjects() {
  return (await getCollection('projects')).sort(
    (a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
}

export const roleOf = (p: Project) => roleByKey(p.data.experience);

export const mediaOf = (p: Project) =>
  projectMedia(p.id, { exclude: p.data.exclude, captions: p.data.captions });

export const coverOf = (p: Project) => projectCover(mediaOf(p), p.data.cover);

/** A small optimised cover URL for previews, or undefined if the project has no photos. */
export async function coverThumb(p: Project, width = 900) {
  const cover = coverOf(p);
  if (!cover) return undefined;
  return (await getImage({ src: cover.src, width: Math.min(width, cover.src.width), format: 'webp' })).src;
}
