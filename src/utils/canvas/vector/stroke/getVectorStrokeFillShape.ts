// types
import { TVectorNode } from 'types/design/types';
import { TVectorStrokeShape } from './types';

// utils
import { getVectorPathStrokeShape } from './getVectorPathStrokeShape';
import { getVectorStrokePaths } from './getVectorStrokePaths';
import { getVectorStrokeShape } from './getVectorStrokeShape';
import { getVisibleStrokePaints } from './getVisibleStrokePaints';
import { isVectorStrokePathHole } from './isVectorStrokePathHole';

const cache = new WeakMap<TVectorNode, TVectorStrokeShape | null>();

const getUniformStrokeShape = (node: TVectorNode): TVectorStrokeShape | null => {
  const paths = getVectorStrokePaths(node);
  const shapes = paths.map((path) => getVectorPathStrokeShape(node, path, 'uniform', isVectorStrokePathHole(path, paths)));

  return shapes.length > 0 ? shapes : null;
};

const computeVectorStrokeFillShape = (node: TVectorNode): TVectorStrokeShape | null => {
  const hasNonSolidPaint = getVisibleStrokePaints(node.strokes).some((paint) => paint.type !== 'solid');
  return getVectorStrokeShape(node) ?? (hasNonSolidPaint && node.strokeWidth > 0 ? getUniformStrokeShape(node) : null);
};

export const getVectorStrokeFillShape = (node: TVectorNode): TVectorStrokeShape | null => {
  if (!cache.has(node)) {
    cache.set(node, computeVectorStrokeFillShape(node));
  }

  return cache.get(node) ?? null;
};
