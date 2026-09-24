// types
import { TBooleanNode, TSceneNode, TVectorNode } from 'types/design/types';
import { TBooleanStyleCacheEntry } from './types';

// utils
import { applyBooleanStyle } from './applyBooleanStyle';
import { getBooleanGeometry } from './getBooleanGeometry';

const cache = new WeakMap<TBooleanNode, TBooleanStyleCacheEntry>();

export const getBooleanVectorNode = (node: TBooleanNode, nodesById: Record<string, TSceneNode>): TVectorNode | null => {
  const geometry = getBooleanGeometry(node, nodesById);

  if (geometry) {
    const cached = cache.get(node);

    if (cached?.geometry === geometry) {
      return cached.styled;
    }

    const styled = applyBooleanStyle(geometry, node);

    cache.set(node, { geometry, styled });
    return styled;
  }

  return null;
};
