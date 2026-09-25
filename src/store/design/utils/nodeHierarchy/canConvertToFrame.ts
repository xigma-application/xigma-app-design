// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const canConvertToFrame = (selectedNodes: (TSceneNode | undefined)[], nodes: Record<string, TSceneNode>): boolean =>
  selectedNodes.length > 0 &&
  selectedNodes.every(
    (node) => node?.type === NodeType.section && node.childIds.every((childId) => nodes[childId]?.type !== NodeType.section),
  );
