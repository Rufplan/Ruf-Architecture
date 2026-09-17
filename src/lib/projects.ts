import { getCollection, type CollectionEntry } from 'astro:content';
import { roleByKey } from '../data/experience';

export type Project = CollectionEntry<'projects'>;

/** All projects, most recent first. */
export async function getProjects() {
  return (await getCollection('projects')).sort(
    (a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
}

export const roleOf = (p: Project) => roleByKey(p.data.experience);
