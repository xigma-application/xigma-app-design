// types
import { NodeType } from 'types/design/enums';
import { TBooleanCacheEntry } from './types';
import { TBooleanNode, TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { computeBooleanVectorNode } from './computeBooleanVectorNode';
import { getBooleanOperandVector } from './getBooleanOperandVector';
import { isBooleanCacheHit } from './isBooleanCacheHit';

const cache = new WeakMap<TBooleanNode, TBooleanCacheEntry>();

export const getBooleanVectorNode = (node: TBooleanNode, nodesById: Record<string, TSceneNode>): TVectorNode | null => {
  const operands = node.childIds.map((childId) => (nodesById[childId] ? getBooleanOperandVector(nodesById[childId], nodesById) : null));
  const cached = cache.get(node);

  if (!isBooleanCacheHit(cached, operands)) {
    const result = computeBooleanVectorNode(
      node,
      operands.filter((operand): operand is TVectorNode => operand !== null && operand.type === NodeType.vector),
    );

    cache.set(node, { operands, result });
    return result;
  }

  return cached.result;
};
