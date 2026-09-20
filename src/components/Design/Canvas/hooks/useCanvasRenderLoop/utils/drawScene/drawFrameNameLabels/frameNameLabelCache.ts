// types
import { TFrameNode } from 'types/design/types';

export type TFrameNameLabelCacheEntry = {
  node: TFrameNode;
  vertices: Float32Array;
  zoom: number;
};

export const FRAME_NAME_LABEL_CACHE_MAX_ENTRIES = 256;

export const frameNameLabelCache = new Map<string, TFrameNameLabelCacheEntry>();
