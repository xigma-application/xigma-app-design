// types
import { TBooleanNode } from 'types/design/types';
import { TGlassShapeSdf, TGlassShapeSdfCacheEntry, TMaskRenderer } from './types';

// utils
import { computeShapeSdf } from 'utils/canvas/shapeSdf/computeShapeSdf';
import { createShapeSdfTexture } from 'utils/canvas/shapeSdf/createShapeSdfTexture';
import { getBooleanShape } from '../drawBooleanLeafNode/getBooleanShape';
import { getBooleanVectorNode } from 'utils/canvas/booleanOperation/getBooleanVectorNode';

const cache = new Map<string, TGlassShapeSdfCacheEntry>();

export const getBooleanGlassSdf = (renderer: TMaskRenderer, node: TBooleanNode): TGlassShapeSdf | null => {
  const vector = getBooleanVectorNode(node, renderer.nodesById ?? Object.fromEntries(renderer.sceneNodeById));

  if (vector) {
    const shape = getBooleanShape(vector);
    const cached = cache.get(node.id);

    if (cached?.shape !== shape) {
      if (cached) {
        renderer.gl.deleteTexture(cached.texture);
      }

      const sdf = computeShapeSdf(shape.polygons, shape.bounds);
      const entry: TGlassShapeSdfCacheEntry = {
        bounds: shape.bounds,
        origin: sdf.origin,
        shape,
        size: { height: sdf.height * sdf.cellSize, width: sdf.width * sdf.cellSize },
        texture: createShapeSdfTexture(renderer.gl, sdf),
      };

      cache.set(node.id, entry);
      return entry;
    }

    return cached;
  }

  return null;
};
