import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    year: z.number(),
    location: z.string(),
    typology: z.string(),
    status: z.string(),
    area: z.string().optional(),
    summary: z.string(),
    // Procedural Three.js massing model used as the project's graphic.
    form: z.enum(['tower', 'slab', 'courtyard', 'cantilever', 'terrace', 'cluster']),
    seed: z.number().default(1),
    // Optional photography / drawings placed in /public (e.g. "/images/lake-house/01.jpg").
    gallery: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() })).default([]),
    credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
  }),
});

export const collections = { projects };
