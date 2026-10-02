import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectSchema = z.object({
  name: z.object({ en: z.string(), de: z.string() }),
  projectType: z.object({ en: z.string(), de: z.string() }),
  year: z.string(),
  company: z.string().optional(),
  inDevelopment: z.boolean().default(false),
  roles: z.array(z.string()).default([]),
  teammembers: z.array(z.string()).optional(),
  description: z.object({ en: z.string(), de: z.string() }),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  heroAltLayout: z.boolean().optional(),
  threeMockup: z.enum(['phone', 'hololens']).nullable().optional(),
  gallery: z.array(z.string()).optional(),
  draft: z.boolean().optional(),
  order: z.number().optional(),
});

const markdownId = {
  generateId: ({ entry }: { entry: string }) => entry.replace(/\.md$/i, ''),
};

export const collections = {
  projects: defineCollection({
    loader: glob({
      base: './src/content/projects',
      pattern: '**/*.md',
      ...markdownId,
    }),
    schema: projectSchema,
  }),
  'projects-de': defineCollection({
    loader: glob({
      base: './src/content/projects-de',
      pattern: '**/*.md',
      ...markdownId,
    }),
    schema: projectSchema,
  }),
};
