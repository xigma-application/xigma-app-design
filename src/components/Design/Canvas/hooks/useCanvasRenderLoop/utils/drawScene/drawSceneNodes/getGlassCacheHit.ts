// types
import { TGlassCacheEntry, TScissorRect } from './types';

// utils
import { GLASS_CACHE_SIZE_TOLERANCE_PX, glassCaches } from './glassCaches';

const isWithin = (from: number, to: number, validFrom: number, validTo: number): boolean =>
  from >= validFrom - GLASS_CACHE_SIZE_TOLERANCE_PX && to <= validTo + GLASS_CACHE_SIZE_TOLERANCE_PX;

const isSameSize = (entry: TGlassCacheEntry, rect: TScissorRect): boolean =>
  Math.abs(entry.rawWidth - (rect.rawWidth ?? rect.width)) <= GLASS_CACHE_SIZE_TOLERANCE_PX &&
  Math.abs(entry.rawHeight - (rect.rawHeight ?? rect.height)) <= GLASS_CACHE_SIZE_TOLERANCE_PX;

const coversRect = (entry: TGlassCacheEntry, rect: TScissorRect): boolean => {
  const scaleX = entry.rawWidth / (rect.rawWidth ?? rect.width);
  const scaleY = entry.rawHeight / (rect.rawHeight ?? rect.height);
  const localX = rect.x - (rect.originX ?? rect.x);
  const localY = rect.y - (rect.originY ?? rect.y);

  return (
    isWithin(localX * scaleX, (localX + rect.width) * scaleX, entry.validLeft, entry.validRight) &&
    isWithin(localY * scaleY, (localY + rect.height) * scaleY, entry.validBottom, entry.validTop)
  );
};

export const getGlassCacheHit = (
  gl: WebGL2RenderingContext,
  nodeId: string,
  nodesState: unknown,
  rect: TScissorRect,
): TGlassCacheEntry | undefined => {
  const entry = glassCaches.get(gl)?.get(nodeId);

  if (entry && entry.nodesState === nodesState && isSameSize(entry, rect) && coversRect(entry, rect)) {
    return entry;
  }
};
