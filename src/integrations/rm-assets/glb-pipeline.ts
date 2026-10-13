import type { Document, Transform } from '@gltf-transform/core';
import { dedup, meshopt, prune, reorder, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import type { GlbProfile } from './constants.ts';

/** Remove vertex attributes the portrait never reads so weld can merge flat-shaded corners. */
function stripAttributes(semantics: string[]): Transform {
  const fn = (document: Document) => {
    for (const mesh of document.getRoot().listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        for (const semantic of semantics) {
          const attr = prim.getAttribute(semantic);
          if (!attr) continue;
          prim.setAttribute(semantic, null);
        }
      }
    }
  };
  Object.defineProperty(fn, 'name', { value: 'stripAttributes' });
  return fn;
}

export function glbTransforms(profile: GlbProfile): Transform[] {
  switch (profile) {
    case 'flat-shaded-portrait':
      return [
        stripAttributes(['NORMAL', 'TANGENT', 'COLOR_0', 'TEXCOORD_0', 'TEXCOORD_1']),
        dedup(),
        weld(),
        prune(),
        reorder({ encoder: MeshoptEncoder }),
        meshopt({ encoder: MeshoptEncoder, level: 'high' }),
      ];
    case 'generic':
    default:
      return [
        dedup(),
        prune(),
        textureCompress({ targetFormat: 'webp', resize: [2048, 2048] }),
        meshopt({ encoder: MeshoptEncoder, level: 'high' }),
      ];
  }
}
