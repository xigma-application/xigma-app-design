// types
import { TGlassCacheEntry } from './types';

export const GLASS_CACHE_MAX_ENTRIES = 4096;
export const GLASS_CACHE_MAX_BYTES = 128 * 1024 * 1024;
export const GLASS_CACHE_BYTES_PER_PIXEL = 8;
export const GLASS_CACHE_SIZE_TOLERANCE_PX = 1;
export const GLASS_MIN_FROST_RADIUS_PX = 1;

export const glassCaches = new WeakMap<WebGL2RenderingContext, Map<string, TGlassCacheEntry>>();
