// types
import { TBlurCacheEntry } from './types';

// utils
import { BLUR_CACHE_BYTES_PER_PIXEL, BLUR_CACHE_MAX_BYTES, BLUR_CACHE_MAX_ENTRIES } from './blurCaches';
import { deleteBlurCacheEntry } from './deleteBlurCacheEntry';

const getEntryBytes = (entry: TBlurCacheEntry): number => entry.width * entry.height * BLUR_CACHE_BYTES_PER_PIXEL;

const getCachedBytes = (cache: Map<string, TBlurCacheEntry>): number => {
  let bytes = 0;

  cache.forEach((entry) => {
    bytes += getEntryBytes(entry);
  });

  return bytes;
};

export const evictBlurCacheEntries = (gl: WebGL2RenderingContext, cache: Map<string, TBlurCacheEntry>, incomingBytes: number): void => {
  let bytes = incomingBytes + getCachedBytes(cache);

  while (cache.size > 0 && (cache.size >= BLUR_CACHE_MAX_ENTRIES || bytes > BLUR_CACHE_MAX_BYTES)) {
    const oldestKey = cache.keys().next().value as string;

    bytes -= getEntryBytes(cache.get(oldestKey) as TBlurCacheEntry);
    deleteBlurCacheEntry(gl, oldestKey);
  }
};
