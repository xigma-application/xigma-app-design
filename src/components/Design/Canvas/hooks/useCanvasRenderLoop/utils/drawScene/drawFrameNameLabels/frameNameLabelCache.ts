export type TFrameNameLabelCacheEntry = {
  key: string;
  vertices: Float32Array;
};

export const FRAME_NAME_LABEL_CACHE_MAX_ENTRIES = 256;

export const frameNameLabelCache = new Map<string, TFrameNameLabelCacheEntry>();
