// types
import { TGlassCacheEntry, TScissorRect } from './types';

// utils
import { glassCaches } from './glassCaches';

export const getStretchableGlassCacheEntry = (
  gl: WebGL2RenderingContext,
  cacheKey: string,
  nodesState: unknown,
  rect: TScissorRect,
): TGlassCacheEntry | undefined => {
  const entry = glassCaches.get(gl)?.get(cacheKey);

  if (
    entry &&
    entry.nodesState === nodesState &&
    !rect.clipped &&
    entry.localX === 0 &&
    entry.localY === 0 &&
    entry.width === entry.rawWidth &&
    entry.height === entry.rawHeight
  ) {
    return entry;
  }
};
