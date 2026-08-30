// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';

export const getEligibleVectorWidthNodes = (nodeIds: string[], nodes: Record<string, TSceneNode>): TVectorNode[] =>
  nodeIds
    .map((nodeId) => nodes[nodeId])
    .filter((node): node is TVectorNode => node !== undefined && node.type === NodeType.vector && getVectorChainOrder(node) !== null);
