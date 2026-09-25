// types
import { StrokeAlign } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorStrokeShape } from './types';

// utils
import { getLineStrokeMode } from 'utils/canvas/line/stroke/getLineStrokeMode';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getVectorPathStrokeShape } from './getVectorPathStrokeShape';
import { getVectorStrokePaths } from './getVectorStrokePaths';
import { isVectorStrokePathHole } from './isVectorStrokePathHole';

const cache = new WeakMap<TVectorNode, TVectorStrokeShape | null>();

const computeVectorStrokeShape = (node: TVectorNode): TVectorStrokeShape | null => {
  if (node.strokeWidth > 0) {
    const mode = getLineStrokeMode(node, getStrokeDashPattern(node));
    const paths = getVectorStrokePaths(node);
    const isAligned = (node.strokeAlign ?? StrokeAlign.center) !== StrokeAlign.center && paths.some((path) => path.closed);

    if (mode !== 'uniform' || isAligned) {
      const shapes = paths.map((path) => getVectorPathStrokeShape(node, path, mode, isVectorStrokePathHole(path, paths)));
      return shapes.length > 0 ? shapes : null;
    }
  }

  return null;
};

export const getVectorStrokeShape = (node: TVectorNode): TVectorStrokeShape | null => {
  if (!cache.has(node)) {
    cache.set(node, computeVectorStrokeShape(node));
  }

  return cache.get(node) ?? null;
};
