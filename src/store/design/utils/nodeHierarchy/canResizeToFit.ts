// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const canResizeToFit = (selectedNodes: (TSceneNode | undefined)[], nodes: Record<string, TSceneNode>): boolean =>
  selectedNodes.some(
    (node) =>
      (node?.type === NodeType.frame || node?.type === NodeType.section) && node.childIds.some((childId) => nodes[childId] !== undefined),
  );
