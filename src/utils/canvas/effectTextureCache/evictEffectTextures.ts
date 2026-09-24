// types
import { TEffectTextureCache, TEffectTextureEntry } from './types';

// others
import { EFFECT_TEXTURE_CACHE_MAX_BYTES } from './constants';

export const evictEffectTextures = (gl: WebGL2RenderingContext, cache: TEffectTextureCache): void => {
  const keys = cache.entries.keys();

  while (cache.bytes > EFFECT_TEXTURE_CACHE_MAX_BYTES && cache.entries.size > 1) {
    const key = keys.next().value as string;
    const entry = cache.entries.get(key) as TEffectTextureEntry;

    gl.deleteTexture(entry.texture);
    cache.bytes -= entry.bytes;
    cache.entries.delete(key);
  }
};
