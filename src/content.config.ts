import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // Key into src/data/experience.ts — the firm and role this work was done under.
    experience: z.string(),
    location: z.string(),
    years: z.string(),
    // Used for sorting (most recent first).
    year: z.number(),
    typology: z.string(),
    featured: z.boolean().default(false),
    summary: z.string().optional(),
    area: z.string().optional(),
    status: z.string().optional(),
    // Abstract Three.js massing diagram used as the project's graphic.
    form: z.enum(['tower', 'slab', 'courtyard', 'cantilever', 'terrace', 'cluster']),
    seed: z.number().default(1),
    // Optional extra images from /public. Photos in images/projects/<slug>/ are picked up automatically.
    gallery: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() })).default([]),
  }),
});

export const collections = { projects };
