// types
import { TBlurCacheEntry } from './types';

// utils
import { blurCaches } from './blurCaches';

export const getBlurCacheEntry = (gl: WebGL2RenderingContext, nodeId: string, key: string): TBlurCacheEntry | null => {
  const cache = blurCaches.get(gl);
  const entry = cache?.get(nodeId);

  if (cache && entry && entry.key === key) {
    cache.delete(nodeId);
    cache.set(nodeId, entry);

    return entry;
  }

  return null;
};
