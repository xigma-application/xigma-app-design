// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TGlassCacheEntry, TScissorRect } from './types';

// utils
import { deleteGlassCacheEntry } from './deleteGlassCacheEntry';
import { GLASS_CACHE_MAX_ENTRIES, glassCaches } from './glassCaches';

const evictOldestGlassCacheEntry = (gl: WebGL2RenderingContext, cache: Map<string, TGlassCacheEntry>): void => {
  if (cache.size >= GLASS_CACHE_MAX_ENTRIES) {
    deleteGlassCacheEntry(gl, cache.keys().next().value as string);
  }
};

export const storeGlassCacheEntry = (
  gl: WebGL2RenderingContext,
  nodeId: string,
  nodesState: unknown,
  source: TRenderTarget,
  rect: TScissorRect,
): void => {
  const cache = glassCaches.get(gl) ?? new Map();
  const texture = gl.createTexture() as WebGLTexture;
  const framebuffer = gl.createFramebuffer() as WebGLFramebuffer;

  glassCaches.set(gl, cache);
  deleteGlassCacheEntry(gl, nodeId);
  evictOldestGlassCacheEntry(gl, cache);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rect.width, rect.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.framebuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
  gl.blitFramebuffer(
    rect.x,
    rect.y,
    rect.x + rect.width,
    rect.y + rect.height,
    0,
    0,
    rect.width,
    rect.height,
    gl.COLOR_BUFFER_BIT,
    gl.NEAREST,
  );

  cache.set(nodeId, { framebuffer, height: rect.height, nodesState, texture, width: rect.width, x: rect.x, y: rect.y });
};
