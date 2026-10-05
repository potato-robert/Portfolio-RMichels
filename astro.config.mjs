import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import rmAssetsIntegration from './src/integrations/rm-assets/index.ts';
import { rehypeResponsiveMedia } from './src/plugins/rehype-responsive-media.ts';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot =
  path.basename(configDir) === '.perf-data' ? path.resolve(configDir, '..') : configDir;
const viteFsAllow = [configDir, repoRoot, path.join(repoRoot, 'node_modules')];

export default defineConfig({
  site: 'https://rmichels.com',
  output: 'static',
  compressHTML: true,
  markdown: {
    processor: unified({
      gfm: true,
      smartypants: true,
      rehypePlugins: [rehypeResponsiveMedia],
    }),
  },
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    rmAssetsIntegration(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          de: 'de',
        },
      },
    }),
  ],
  vite: {
    server: {
      fs: {
        allow: viteFsAllow,
      },
    },
    // Docker audit profiles reach preview via host.docker.internal (Host header check).
    preview: {
      allowedHosts: ['host.docker.internal'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          // Legacy @import stack in src/styles/; migrate to @use before Dart Sass 3.0.
          silenceDeprecations: ['import', 'global-builtin', 'if-function'],
        },
      },
    },
  },
});
