/**
 * Zod schema mirrored from src/content.config.ts for validate-content.mjs.
 * Keep in sync when project frontmatter fields change.
 * `format` slugs are read from src/lib/formats.ts so the two lists cannot drift.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const formatsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/lib/formats.ts');
const formatsSource = fs.readFileSync(formatsPath, 'utf8');
const formatSlugMatch = formatsSource.match(/export const formatSlugs = \[([\s\S]*?)\] as const/);
const formatSlugList = formatSlugMatch
  ? [...formatSlugMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1])
  : [];
if (formatSlugList.length === 0) {
  throw new Error('Could not read formatSlugs from src/lib/formats.ts');
}

/** @type {[string, ...string[]]} */
const formatSlugs = /** @type {[string, ...string[]]} */ (formatSlugList);

const stackPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/lib/stack.ts');
const stackSource = fs.readFileSync(stackPath, 'utf8');
const stackSlugMatch = stackSource.match(/export const stackSlugs = \[([\s\S]*?)\] as const/);
const stackSlugList = stackSlugMatch
  ? [...stackSlugMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1])
  : [];
if (stackSlugList.length === 0) {
  throw new Error('Could not read stackSlugs from src/lib/stack.ts');
}

/** @type {[string, ...string[]]} */
const stackSlugs = /** @type {[string, ...string[]]} */ (stackSlugList);

export const projectSchema = z
  .object({
    slug: z.string().optional(),
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

/** Fields that must match between EN and DE files for the same slug. */
export const PARITY_FIELDS = [
  'slug',
  'year',
  'ongoing',
  'context',
  'organization',
  'organizationUrl',
  'inDevelopment',
  'stack',
  'heroAltLayout',
  'threeMockup',
  'draft',
  'order',
  'hideFromHome',
  'name',
  'format',
  'description',
  'links',
];
