// types
import { TGlassCacheEntry } from './types';

// utils
import { deleteGlassCacheEntry } from './deleteGlassCacheEntry';
import { evictGlassCacheEntries } from './evictGlassCacheEntries';
import { GLASS_CACHE_BYTES_PER_PIXEL, glassCaches } from './glassCaches';

export const putGlassCacheEntry = (gl: WebGL2RenderingContext, nodeId: string, entry: TGlassCacheEntry): void => {
  const cache = glassCaches.get(gl) ?? new Map<string, TGlassCacheEntry>();

  glassCaches.set(gl, cache);
  deleteGlassCacheEntry(gl, nodeId);
  evictGlassCacheEntries(gl, cache, entry.width * entry.height * GLASS_CACHE_BYTES_PER_PIXEL);
  cache.set(nodeId, entry);
};
