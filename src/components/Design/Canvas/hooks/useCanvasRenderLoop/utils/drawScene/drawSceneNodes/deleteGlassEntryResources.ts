// types
import { TGlassCacheEntry } from './types';

export const deleteGlassEntryResources = (gl: WebGL2RenderingContext, entry: TGlassCacheEntry): void => {
  gl.deleteFramebuffer(entry.framebuffer);
  gl.deleteTexture(entry.texture);
  gl.deleteFramebuffer(entry.maskFramebuffer);
  gl.deleteTexture(entry.maskTexture);
};
