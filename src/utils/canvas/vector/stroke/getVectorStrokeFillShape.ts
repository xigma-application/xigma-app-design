// types
import { TVectorNode } from 'types/design/types';
import { TVectorStrokeShape } from './types';

// utils
import { getVectorStrokeShape } from './getVectorStrokeShape';
import { getVectorUniformStrokeShape } from './getVectorUniformStrokeShape';
import { getVisibleStrokePaints } from './getVisibleStrokePaints';

const cache = new WeakMap<TVectorNode, TVectorStrokeShape | null>();

const computeVectorStrokeFillShape = (node: TVectorNode): TVectorStrokeShape | null => {
  const hasNonSolidPaint = getVisibleStrokePaints(node.strokes).some((paint) => paint.type !== 'solid');
  return getVectorStrokeShape(node) ?? (hasNonSolidPaint && node.strokeWidth > 0 ? getVectorUniformStrokeShape(node) : null);
};

export const getVectorStrokeFillShape = (node: TVectorNode): TVectorStrokeShape | null => {
  if (!cache.has(node)) {
    cache.set(node, computeVectorStrokeFillShape(node));
  }

  return cache.get(node) ?? null;
};
