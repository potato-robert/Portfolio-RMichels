/** Technologies used as case-study stack tags and as the single `?filter=` value. */
export const stackSlugs = [
  'csharp',
  'cpp',
  'dart',
  'typescript',
  'sass',
  'php',
  'java',
  'dotnet',
  'flutter',
  'blazor',
  'threejs',
  'astro',
  'd3js',
  'xr',
  'unity',
  'firebase',
  'gcp',
  'mysql',
  'mfc',
  'mrtk',
  'prototyping',
  'ux-ui-wireframing',
  'figma',
  'gis',
  'cad',
  '3d-modelling',
  'photogrammetry',
  'ai-development',
  'rhino',
] as const;

export type StackSlug = (typeof stackSlugs)[number];

export interface StackEntry {
  slug: StackSlug;
  label: string;
}

export const stacks: StackEntry[] = [
  { slug: 'csharp', label: 'C#' },
  { slug: 'cpp', label: 'C++' },
  { slug: 'dart', label: 'Dart' },
  { slug: 'typescript', label: 'TypeScript' },
  { slug: 'sass', label: 'Sass' },
  { slug: 'php', label: 'PHP' },
  { slug: 'java', label: 'Java' },
  { slug: 'dotnet', label: '.NET' },
  { slug: 'flutter', label: 'Flutter' },
  { slug: 'blazor', label: 'Blazor' },
  { slug: 'threejs', label: 'Three.js' },
  { slug: 'astro', label: 'Astro' },
  { slug: 'd3js', label: 'D3.js' },
  { slug: 'xr', label: 'XR' },
  { slug: 'unity', label: 'Unity' },
  { slug: 'firebase', label: 'Firebase' },
  { slug: 'gcp', label: 'GCP' },
  { slug: 'mysql', label: 'MySQL' },
  { slug: 'mfc', label: 'MFC' },
  { slug: 'mrtk', label: 'MRTK' },
  { slug: 'prototyping', label: 'Prototyping' },
  { slug: 'ux-ui-wireframing', label: 'UX/UI Wireframing' },
  { slug: 'figma', label: 'Figma' },
  { slug: 'gis', label: 'GIS' },
  { slug: 'cad', label: 'CAD' },
  { slug: '3d-modelling', label: '3D Modelling' },
  { slug: 'photogrammetry', label: 'Photogrammetry' },
  { slug: 'ai-development', label: 'AI Development' },
  { slug: 'rhino', label: 'Rhino' },
];

export function getStackBySlug(slug: string): StackEntry | undefined {
  return stacks.find((entry) => entry.slug === slug);
}

export function getStackLabel(slug: string): string {
  return getStackBySlug(slug)?.label ?? slug;
}

/** Keep a `?filter=` value only when at least one project lists that slug. */
export function stackFilterWithMatches(
  filter: string | null | undefined,
  projectStacks: Iterable<readonly string[]>,
): string | null {
  if (!filter) return null;
  for (const stack of projectStacks) {
    if (stack.includes(filter)) return filter;
  }
  return null;
}

/** Catalog order, limited to slugs that appear on at least one project. */
export function stacksInUse(used: Iterable<string>): StackEntry[] {
  const present = new Set(used);
  return stacks.filter((entry) => present.has(entry.slug));
}
