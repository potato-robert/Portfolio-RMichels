import type { AstroIntegration } from 'astro';
import { processRmAssets } from './process.ts';
import { rmAssetsManifestVitePlugin } from './vite-plugin.ts';

export { rmAssetsManifestVitePlugin } from './vite-plugin.ts';

export function rmAssetsIntegration(): AstroIntegration {
  const run = async () => {
    console.log('rm-assets: syncing public/assets (see progress below)…');
    await processRmAssets(process.cwd());
    console.log('rm-assets: sync complete');
  };

  return {
    name: 'rm-assets',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [rmAssetsManifestVitePlugin(process.cwd())],
          },
        });
      },
      'astro:build:start': run,
      'astro:server:start': run,
    },
  };
}

export default rmAssetsIntegration;
