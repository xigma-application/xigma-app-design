// types
import { TMaskRenderer, TScissorRect } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getChangedNodes } from 'store/design/utils/getChangedNodes';
import { glassCaches } from './glassCaches';
import { isGlassRectAffected } from './isGlassRectAffected';

export const refreshGlassCacheEntry = (
  renderer: TMaskRenderer,
  nodeId: string,
  nodesState: unknown,
  rect: TScissorRect,
  cacheKey: string = nodeId,
): void => {
  const entry = glassCaches.get(renderer.gl)?.get(cacheKey);

  if (entry && entry.nodesState !== nodesState) {
    const changed = getChangedNodes(entry.nodesState as Record<string, TSceneNode>, nodesState as Record<string, TSceneNode>);

    if (!isGlassRectAffected(renderer, nodeId, rect, changed)) {
      entry.nodesState = nodesState;
    }
  }
};
