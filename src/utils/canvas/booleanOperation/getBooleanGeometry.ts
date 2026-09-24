// types
import { NodeType } from 'types/design/enums';
import { TBooleanCacheEntry } from './types';
import { TBooleanNode, TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { computeBooleanVectorNode } from './computeBooleanVectorNode';
import { getBooleanOperandVector } from './getBooleanOperandVector';
import { isBooleanCacheHit } from './isBooleanCacheHit';

const cache = new Map<string, TBooleanCacheEntry>();

export const getBooleanGeometry = (node: TBooleanNode, nodesById: Record<string, TSceneNode>): TVectorNode | null => {
  const operands = node.childIds.map((childId) => (nodesById[childId] ? getBooleanOperandVector(nodesById[childId], nodesById) : null));
  const cached = cache.get(node.id);

  if (!isBooleanCacheHit(cached, node.booleanOperation, operands)) {
    const result = computeBooleanVectorNode(
      node,
      operands.filter((operand): operand is TVectorNode => operand !== null && operand.type === NodeType.vector),
    );

    cache.set(node.id, { operands, operation: node.booleanOperation, result });
    return result;
  }

  return cached.result;
};
