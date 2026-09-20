// types
import { TFrameNode } from 'types/design/types';

// utils
import { buildFrameNameLabelVertices } from './buildFrameNameLabelVertices';
import { FRAME_NAME_LABEL_CACHE_MAX_ENTRIES, frameNameLabelCache } from './frameNameLabelCache';

const evictOldestFrameNameLabelCacheEntry = (): void => {
  if (frameNameLabelCache.size >= FRAME_NAME_LABEL_CACHE_MAX_ENTRIES) {
    frameNameLabelCache.delete(frameNameLabelCache.keys().next().value as string);
  }
};

export const getFrameNameLabelVertices = (node: TFrameNode, zoom: number): Float32Array => {
  const cached = frameNameLabelCache.get(node.id);

  if (cached && cached.node === node && cached.zoom === zoom) {
    return cached.vertices;
  }

  const vertices = buildFrameNameLabelVertices(node, zoom);

  evictOldestFrameNameLabelCacheEntry();
  frameNameLabelCache.set(node.id, { node, vertices, zoom });

  return vertices;
};
