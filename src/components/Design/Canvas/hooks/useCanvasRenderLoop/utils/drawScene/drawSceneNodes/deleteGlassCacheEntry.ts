// utils
import { glassCaches } from './glassCaches';

export const deleteGlassCacheEntry = (gl: WebGL2RenderingContext, nodeId: string): void => {
  const cache = glassCaches.get(gl);
  const entry = cache?.get(nodeId);

  if (cache && entry) {
    gl.deleteFramebuffer(entry.framebuffer);
    gl.deleteTexture(entry.texture);
    gl.deleteFramebuffer(entry.maskFramebuffer);
    gl.deleteTexture(entry.maskTexture);
    cache.delete(nodeId);
  }
};
