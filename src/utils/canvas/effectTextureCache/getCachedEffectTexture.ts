// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// others
import { EFFECT_TEXTURE_BYTES_PER_PIXEL } from './constants';

// utils
import { evictEffectTextures } from './evictEffectTextures';
import { getEffectTextureCache } from './getEffectTextureCache';

export const getCachedEffectTexture = (gl: WebGL2RenderingContext, key: string, build: () => TRenderTarget): WebGLTexture => {
  const cache = getEffectTextureCache(gl);
  const hit = cache.entries.get(key);

  if (!hit) {
    const target = build();
    const bytes = target.width * target.height * EFFECT_TEXTURE_BYTES_PER_PIXEL;

    gl.deleteFramebuffer(target.framebuffer);
    gl.deleteRenderbuffer(target.stencil);
    cache.entries.set(key, { bytes, texture: target.texture });
    cache.bytes += bytes;
    evictEffectTextures(gl, cache);

    return target.texture;
  }

  cache.entries.delete(key);
  cache.entries.set(key, hit);

  return hit.texture;
};
