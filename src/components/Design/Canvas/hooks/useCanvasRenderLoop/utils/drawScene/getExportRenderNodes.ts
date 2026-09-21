// types
import { TSceneNode } from 'types/design/types';

// utils
import { collectPatternSourceSubtree } from './collectPatternSourceSubtree';
import { getRenderOrderedNodes } from 'store/design/utils/getRenderOrderedNodes';

export const getExportRenderNodes = (
  nodeId: string,
  nodesById: Record<string, TSceneNode>,
  rootOrder: string[],
  ignoreOverlappingLayers: boolean,
): TSceneNode[] => {
  if (ignoreOverlappingLayers) {
    return collectPatternSourceSubtree(nodeId, nodesById);
  }

  return getRenderOrderedNodes(rootOrder, nodesById).filter((node) => !node.hidden);
};
