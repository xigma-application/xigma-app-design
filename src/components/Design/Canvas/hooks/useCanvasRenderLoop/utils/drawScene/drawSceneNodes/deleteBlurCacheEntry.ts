// utils
import { blurCaches } from './blurCaches';

export const deleteBlurCacheEntry = (gl: WebGL2RenderingContext, nodeId: string): void => {
  const cache = blurCaches.get(gl);
  const entry = cache?.get(nodeId);

  if (cache && entry) {
    gl.deleteFramebuffer(entry.framebuffer);
    gl.deleteTexture(entry.texture);
    cache.delete(nodeId);
  }
};
