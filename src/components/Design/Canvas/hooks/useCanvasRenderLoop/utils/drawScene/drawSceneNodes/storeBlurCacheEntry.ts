// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TBlurCacheEntry, TScissorRect } from './types';

// utils
import { BLUR_CACHE_MAX_ENTRIES, blurCaches } from './blurCaches';
import { deleteBlurCacheEntry } from './deleteBlurCacheEntry';

const evictOldestBlurCacheEntry = (gl: WebGL2RenderingContext, cache: Map<string, TBlurCacheEntry>): void => {
  if (cache.size >= BLUR_CACHE_MAX_ENTRIES) {
    deleteBlurCacheEntry(gl, cache.keys().next().value as string);
  }
};

export const storeBlurCacheEntry = (
  gl: WebGL2RenderingContext,
  nodeId: string,
  key: string,
  source: TRenderTarget,
  rect: TScissorRect,
): void => {
  const cache = blurCaches.get(gl) ?? new Map();
  const texture = gl.createTexture() as WebGLTexture;
  const framebuffer = gl.createFramebuffer() as WebGLFramebuffer;

  blurCaches.set(gl, cache);
  deleteBlurCacheEntry(gl, nodeId);
  evictOldestBlurCacheEntry(gl, cache);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rect.width, rect.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

  cache.set(nodeId, { framebuffer, height: rect.height, key, texture, width: rect.width });
};
