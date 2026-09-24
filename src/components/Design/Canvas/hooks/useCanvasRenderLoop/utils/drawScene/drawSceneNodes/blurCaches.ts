// types
import { TBlurCacheEntry } from './types';

export const BLUR_CACHE_MAX_ENTRIES = 4096;
export const BLUR_CACHE_MAX_BYTES = 128 * 1024 * 1024;
export const BLUR_CACHE_BYTES_PER_PIXEL = 4;

export const blurCaches = new WeakMap<WebGL2RenderingContext, Map<string, TBlurCacheEntry>>();
