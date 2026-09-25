// types
import { TEllipseNode } from 'types/design/types';
import { TVectorStrokeShape } from '../vector/stroke/types';

// utils
import { getAlignedLoopStrokeShape } from './getAlignedLoopStrokeShape';
import { getEllipseStrokeLoops } from './getEllipseStrokeLoops';

const cache = new WeakMap<TEllipseNode, TVectorStrokeShape | null>();

const computeEllipseStrokeShapes = (node: TEllipseNode): TVectorStrokeShape | null =>
  (node.strokeWidth ?? 0) > 0 ? getEllipseStrokeLoops(node).map((loop) => getAlignedLoopStrokeShape(node, loop.points, loop.isHole)) : null;

export const getEllipseStrokeShapes = (node: TEllipseNode): TVectorStrokeShape | null => {
  if (!cache.has(node)) {
    cache.set(node, computeEllipseStrokeShapes(node));
  }

  return cache.get(node) ?? null;
};
