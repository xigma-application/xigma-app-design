// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TGlassCacheEntry, TScissorRect } from './types';

// utils
import { copyTargetRectToTexture } from './copyTargetRectToTexture';
import { deleteGlassCacheEntry } from './deleteGlassCacheEntry';
import { GLASS_CACHE_MAX_ENTRIES, glassCaches } from './glassCaches';

const evictOldestGlassCacheEntry = (gl: WebGL2RenderingContext, cache: Map<string, TGlassCacheEntry>): void => {
  if (cache.size >= GLASS_CACHE_MAX_ENTRIES) {
    deleteGlassCacheEntry(gl, cache.keys().next().value as string);
  }
};

const getValidWindow = (
  rect: TScissorRect,
): Pick<TGlassCacheEntry, 'localX' | 'localY' | 'validBottom' | 'validLeft' | 'validRight' | 'validTop'> => {
  const margin = rect.margin ?? 0;
  const localX = rect.x - (rect.originX ?? rect.x);
  const localY = rect.y - (rect.originY ?? rect.y);
  const rawWidth = rect.rawWidth ?? rect.width;
  const rawHeight = rect.rawHeight ?? rect.height;

  return {
    localX,
    localY,
    validBottom: localY + (localY > 0 ? margin : 0),
    validLeft: localX + (localX > 0 ? margin : 0),
    validRight: localX + rect.width - (localX + rect.width < rawWidth ? margin : 0),
    validTop: localY + rect.height - (localY + rect.height < rawHeight ? margin : 0),
  };
};

export const storeGlassCacheEntry = (
  gl: WebGL2RenderingContext,
  nodeId: string,
  nodesState: unknown,
  warped: TRenderTarget,
  mask: TRenderTarget,
  rect: TScissorRect,
): void => {
  const cache = glassCaches.get(gl) ?? new Map();

  glassCaches.set(gl, cache);
  deleteGlassCacheEntry(gl, nodeId);
  evictOldestGlassCacheEntry(gl, cache);

  const content = copyTargetRectToTexture(gl, warped, rect);
  const shape = copyTargetRectToTexture(gl, mask, rect);

  cache.set(nodeId, {
    ...getValidWindow(rect),
    framebuffer: content.framebuffer,
    height: rect.height,
    maskFramebuffer: shape.framebuffer,
    maskTexture: shape.texture,
    nodesState,
    rawHeight: rect.rawHeight ?? rect.height,
    rawWidth: rect.rawWidth ?? rect.width,
    texture: content.texture,
    width: rect.width,
  });
};
