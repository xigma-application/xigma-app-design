// types
import { TScissorRect } from './types';

// utils
import { GLASS_CACHE_SIZE_TOLERANCE_PX } from './glassCaches';

const lastSizes = new WeakMap<WebGL2RenderingContext, Map<string, { height: number; width: number }>>();

export const isGlassRectStable = (gl: WebGL2RenderingContext, nodeId: string, rect: TScissorRect): boolean => {
  const sizes = lastSizes.get(gl) ?? new Map<string, { height: number; width: number }>();
  const last = sizes.get(nodeId);
  const rawWidth = rect.rawWidth ?? rect.width;
  const rawHeight = rect.rawHeight ?? rect.height;

  lastSizes.set(gl, sizes);
  sizes.set(nodeId, { height: rawHeight, width: rawWidth });

  return (
    last !== undefined &&
    Math.abs(last.width - rawWidth) <= GLASS_CACHE_SIZE_TOLERANCE_PX &&
    Math.abs(last.height - rawHeight) <= GLASS_CACHE_SIZE_TOLERANCE_PX
  );
};
