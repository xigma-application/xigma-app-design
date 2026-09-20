// utils
import { glassCaches } from './glassCaches';

export const deleteGlassCacheEntry = (gl: WebGL2RenderingContext, nodeId: string): void => {
  const cache = glassCaches.get(gl);
  const entry = cache?.get(nodeId);

  if (cache && entry) {
    gl.deleteFramebuffer(entry.framebuffer);
    gl.deleteTexture(entry.texture);
    cache.delete(nodeId);
  }
};
