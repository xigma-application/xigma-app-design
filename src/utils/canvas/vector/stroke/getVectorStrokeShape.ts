// types
import { TVectorNode } from 'types/design/types';
import { TVectorStrokeShape } from './types';

// utils
import { getLineStrokeMode } from 'utils/canvas/line/stroke/getLineStrokeMode';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getVectorPathStrokeShape } from './getVectorPathStrokeShape';
import { getVectorStrokePaths } from './getVectorStrokePaths';

const cache = new WeakMap<TVectorNode, TVectorStrokeShape | null>();

const computeVectorStrokeShape = (node: TVectorNode): TVectorStrokeShape | null => {
  const mode = getLineStrokeMode(node, getStrokeDashPattern(node));

  if (mode !== 'uniform' && node.strokeWidth > 0) {
    const shapes = getVectorStrokePaths(node).map((path) => getVectorPathStrokeShape(node, path, mode));
    return shapes.length > 0 ? shapes : null;
  }

  return null;
};

export const getVectorStrokeShape = (node: TVectorNode): TVectorStrokeShape | null => {
  if (!cache.has(node)) {
    cache.set(node, computeVectorStrokeShape(node));
  }

  return cache.get(node) ?? null;
};
