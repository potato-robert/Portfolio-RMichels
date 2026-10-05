import fs from 'node:fs';
import type { Plugin } from 'vite';
import { repoPaths } from './constants.ts';

export function rmAssetsManifestVitePlugin(root = process.cwd()): Plugin {
  const paths = repoPaths(root);

  return {
    name: 'virtual-rm-assets-manifest',
    resolveId(id) {
      if (id === 'virtual:rm-assets-manifest') return id;
    },
    load(id) {
      if (id !== 'virtual:rm-assets-manifest') return;
      if (!fs.existsSync(paths.manifest)) {
        return 'export default { version: 0, optionVersion: 0, generatedAt: "", entries: {} };';
      }
      const json = fs.readFileSync(paths.manifest, 'utf8');
      return `export default ${json};`;
    },
  };
}
