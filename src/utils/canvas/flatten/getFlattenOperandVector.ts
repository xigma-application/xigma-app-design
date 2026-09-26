// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { convertNodeToVector, isConvertibleToVectorNode } from '../vectorNetwork/convertShapeToVector/convertNodeToVector';
import { getBooleanVectorNode } from '../booleanOperation/getBooleanVectorNode';
import { getDrawnVectorNode } from '../render/getDrawnVectorNode';

export const getFlattenOperandVector = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TVectorNode | null => {
  switch (node.type) {
    case NodeType.boolean:
      return getBooleanVectorNode(node, nodesById);
    case NodeType.vector:
      return getDrawnVectorNode(node);
    default:
      return isConvertibleToVectorNode(node) ? getDrawnVectorNode(convertNodeToVector(node)) : null;
  }
};
