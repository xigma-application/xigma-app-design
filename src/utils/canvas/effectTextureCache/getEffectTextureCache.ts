// types
import { TEffectTextureCache } from './types';

const cacheByContext = new WeakMap<WebGL2RenderingContext, TEffectTextureCache>();

export const getEffectTextureCache = (gl: WebGL2RenderingContext): TEffectTextureCache => {
  const existing = cacheByContext.get(gl);

  if (!existing) {
    const created: TEffectTextureCache = { bytes: 0, entries: new Map() };
    cacheByContext.set(gl, created);

    return created;
  }

  return existing;
};
