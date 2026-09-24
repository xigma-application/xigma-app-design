// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { hasBooleanAncestor } from 'store/design/utils/nodeHierarchy/hasBooleanAncestor';

export const isSnapshotVectorNode = (node: TSceneNode | undefined, nodes: Record<string, TSceneNode>): node is TVectorNode =>
  node?.type === NodeType.vector && !node.widthProfile && !hasBooleanAncestor(node, nodes);
