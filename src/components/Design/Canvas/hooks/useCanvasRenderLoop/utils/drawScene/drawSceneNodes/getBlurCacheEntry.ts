// types
import { TBlurCacheEntry } from './types';

// utils
import { blurCaches } from './blurCaches';

export const getBlurCacheEntry = (gl: WebGL2RenderingContext, nodeId: string, key: string): TBlurCacheEntry | null => {
  const entry = blurCaches.get(gl)?.get(nodeId);
  return entry && entry.key === key ? entry : null;
};
