// types
import { TGlassCacheEntry } from './types';

// utils
import { deleteGlassCacheEntry } from './deleteGlassCacheEntry';
import { GLASS_CACHE_BYTES_PER_PIXEL, GLASS_CACHE_MAX_BYTES, GLASS_CACHE_MAX_ENTRIES } from './glassCaches';

const getEntryBytes = (entry: TGlassCacheEntry): number => entry.width * entry.height * GLASS_CACHE_BYTES_PER_PIXEL;

export const evictGlassCacheEntries = (gl: WebGL2RenderingContext, cache: Map<string, TGlassCacheEntry>, incomingBytes: number): void => {
  let bytes = incomingBytes;

  cache.forEach((entry) => {
    bytes += getEntryBytes(entry);
  });

  while (cache.size > 0 && (cache.size >= GLASS_CACHE_MAX_ENTRIES || bytes > GLASS_CACHE_MAX_BYTES)) {
    const oldestKey = cache.keys().next().value as string;

    bytes -= getEntryBytes(cache.get(oldestKey) as TGlassCacheEntry);
    deleteGlassCacheEntry(gl, oldestKey);
  }
};
