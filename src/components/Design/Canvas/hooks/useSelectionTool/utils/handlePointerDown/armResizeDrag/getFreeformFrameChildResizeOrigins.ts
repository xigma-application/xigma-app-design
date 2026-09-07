// types
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';
import { getResizeNodeOrigin } from './getResizeNodeOrigin';
import { isFreeformFrame } from 'utils/canvas/signals/isFreeformFrame';

export const getFreeformFrameChildResizeOrigins = (
  selectedNodes: TSceneNode[],
  nodes: Record<string, TSceneNode>,
): Record<string, TResizeNodeOrigin> | undefined => {
  const [onlyNode] = selectedNodes;

  if (selectedNodes.length === 1 && isFreeformFrame(onlyNode)) {
    const childOrigins: Record<string, TResizeNodeOrigin> = {};

    getGroupSubtreeNodes(onlyNode, nodes)
      .filter((node) => node.id !== onlyNode.id)
      .forEach((node) => {
        childOrigins[node.id] = getResizeNodeOrigin(node);
      });

    if (Object.keys(childOrigins).length > 0) {
      return childOrigins;
    }
  }

  return undefined;
};
