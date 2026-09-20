// types
import { TGlassCacheEntry } from './types';

export const GLASS_CACHE_MAX_ENTRIES = 254;

export const glassCaches = new WeakMap<WebGL2RenderingContext, Map<string, TGlassCacheEntry>>();
