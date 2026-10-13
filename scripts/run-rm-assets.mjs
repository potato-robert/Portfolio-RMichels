#!/usr/bin/env node
console.log('rm-assets: starting (first run after clone can take several minutes)…');

const { processRmAssets } = await import('../src/integrations/rm-assets/process.ts');

await processRmAssets(process.cwd());
console.log('rm-assets: public/assets generated');
