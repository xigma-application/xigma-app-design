// types
import { TBlurCacheEntry } from './types';

export const BLUR_CACHE_MAX_ENTRIES = 64;

export const blurCaches = new WeakMap<WebGL2RenderingContext, Map<string, TBlurCacheEntry>>();
