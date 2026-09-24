// types
import { TSceneNode } from 'types/design/types';

// utils
import { getEffectiveOpacityFromLookup } from './getEffectiveOpacityFromLookup';

export const getEffectiveOpacity = (node: TSceneNode, nodesById: Record<string, TSceneNode>): number =>
  getEffectiveOpacityFromLookup(node, (id) => nodesById[id]);
