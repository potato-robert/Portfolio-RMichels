/**
 * Zod schema mirrored from src/content.config.ts for validate-content.mjs.
 * Keep in sync when project frontmatter fields change.
 */
import { z } from 'zod';

export const projectSchema = z.object({
  slug: z.string().optional(),
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

/** Fields that must match between EN and DE files for the same slug. */
export const PARITY_FIELDS = [
  'slug',
  'year',
  'company',
  'inDevelopment',
  'roles',
  'teammembers',
  'heroAltLayout',
  'threeMockup',
  'draft',
  'order',
  'name',
  'projectType',
  'description',
  'links',
];
