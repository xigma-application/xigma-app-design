// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { convertNodeToVector, isConvertibleToVectorNode } from '../vectorNetwork/convertShapeToVector/convertNodeToVector';
import { getBooleanStrokeShapeVector } from './getBooleanStrokeShapeVector';
import { getBooleanVectorNode } from './getBooleanVectorNode';
import { getDrawnVectorNode } from '../render/getDrawnVectorNode';

const cache = new WeakMap<TSceneNode, TVectorNode>();

const getShapeVector = (node: TSceneNode): TVectorNode | null => {
  const cached = cache.get(node);

  if (!cached) {
    if (isConvertibleToVectorNode(node)) {
      const vector = getDrawnVectorNode(convertNodeToVector(node));
      cache.set(node, vector);

      return vector;
    }

    return null;
  }

  return cached;
};

export const getBooleanOperandVector = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TVectorNode | null => {
  if (!node.hidden) {
    switch (node.type) {
      case NodeType.boolean:
        return getBooleanVectorNode(node, nodesById);
      case NodeType.line:
        return getBooleanStrokeShapeVector(node);
      case NodeType.vector:
        return node.filledFaceKeys.length > 0 ? getDrawnVectorNode(node) : getBooleanStrokeShapeVector(node);
      default:
        return getShapeVector(node);
    }
  }

  return null;
};
