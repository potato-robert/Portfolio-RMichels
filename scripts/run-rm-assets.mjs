#!/usr/bin/env node
import { processRmAssets } from '../src/integrations/rm-assets/process.ts';

await processRmAssets(process.cwd());
console.log('rm-assets: public/assets generated');
