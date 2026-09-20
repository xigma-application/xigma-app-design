// types
import { TFrameNode } from 'types/design/types';

// utils
import { buildFrameNameLabelVertices } from './buildFrameNameLabelVertices';
import { FRAME_NAME_LABEL_CACHE_MAX_ENTRIES, frameNameLabelCache } from './frameNameLabelCache';
import { getFrameNameLabelCacheKey } from './getFrameNameLabelCacheKey';

const evictOldestFrameNameLabelCacheEntry = (): void => {
  if (frameNameLabelCache.size >= FRAME_NAME_LABEL_CACHE_MAX_ENTRIES) {
    frameNameLabelCache.delete(frameNameLabelCache.keys().next().value as string);
  }
};

export const getFrameNameLabelVertices = (node: TFrameNode, zoom: number): Float32Array => {
  const key = getFrameNameLabelCacheKey(node, zoom);
  const cached = frameNameLabelCache.get(node.id);

  if (cached && cached.key === key) {
    return cached.vertices;
  }

  const vertices = buildFrameNameLabelVertices(node, zoom);

  evictOldestFrameNameLabelCacheEntry();
  frameNameLabelCache.set(node.id, { key, vertices });

  return vertices;
};
