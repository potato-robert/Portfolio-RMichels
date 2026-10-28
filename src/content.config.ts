import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { formatSlugs } from './lib/formats';
import { stackSlugs } from './lib/stack';

const projectSchema = z
  .object({
    name: z.object({ en: z.string(), de: z.string() }),
    format: z.enum(formatSlugs),
    year: z.string(),
    ongoing: z.boolean().default(false),
    context: z.enum(['employment', 'personal', 'coursework']),
    organization: z.string().optional(),
    organizationUrl: z.string().optional(),
    inDevelopment: z.boolean().default(false),
    stack: z.array(z.enum(stackSlugs)).min(1),
    description: z.object({ en: z.string(), de: z.string() }),
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    heroAltLayout: z.boolean().optional(),
    threeMockup: z.enum(['phone', 'hololens']).nullable().optional(),
    gallery: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    order: z.number().optional(),
    hideFromHome: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.context === 'employment' && !data.organization) {
      ctx.addIssue({
        code: 'custom',
        path: ['organization'],
        message: 'employment context requires organization',
      });
    }
    if (data.organizationUrl && !data.organization) {
      ctx.addIssue({
        code: 'custom',
        path: ['organizationUrl'],
        message: 'organizationUrl requires organization',
      });
    }
    if (data.ongoing && /[–-]/.test(data.year)) {
      ctx.addIssue({
        code: 'custom',
        path: ['year'],
        message: 'ongoing projects use a start year; the present label is added in the UI',
      });
    }
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
