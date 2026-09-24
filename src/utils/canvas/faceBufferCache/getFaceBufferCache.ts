// utils
import { TrackedFaceBufferCache } from './TrackedFaceBufferCache';

const cacheByContext = new WeakMap<WebGL2RenderingContext, TrackedFaceBufferCache>();

export const getFaceBufferCache = (gl: WebGL2RenderingContext): TrackedFaceBufferCache => {
  const existing = cacheByContext.get(gl);

  if (!existing) {
    const created = new TrackedFaceBufferCache();
    cacheByContext.set(gl, created);

    return created;
  }

  return existing;
};
