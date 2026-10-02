import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rmichels.com',
  output: 'static',
  compressHTML: true,
  markdown: {
    processor: unified({
      gfm: true,
      smartypants: true,
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
