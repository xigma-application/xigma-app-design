// types
import { TGlassCacheEntry } from './types';

// utils
import { deleteGlassCacheEntry } from './deleteGlassCacheEntry';
import { GLASS_CACHE_MAX_ENTRIES, glassCaches } from './glassCaches';

export const putGlassCacheEntry = (gl: WebGL2RenderingContext, nodeId: string, entry: TGlassCacheEntry): void => {
  const cache = glassCaches.get(gl) ?? new Map<string, TGlassCacheEntry>();

  glassCaches.set(gl, cache);
  deleteGlassCacheEntry(gl, nodeId);

  if (cache.size >= GLASS_CACHE_MAX_ENTRIES) {
    deleteGlassCacheEntry(gl, cache.keys().next().value as string);
  }

  cache.set(nodeId, entry);
};
