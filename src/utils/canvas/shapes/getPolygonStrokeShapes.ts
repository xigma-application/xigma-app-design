// types
import { TPolygonNode } from 'types/design/types';
import { TVectorStrokeShape } from '../vector/stroke/types';

// utils
import { getAlignedLoopStrokeShape } from './getAlignedLoopStrokeShape';
import { getPolygonWorldPoints } from './getPolygonWorldPoints';

const cache = new WeakMap<TPolygonNode, TVectorStrokeShape | null>();

const computePolygonStrokeShapes = (node: TPolygonNode): TVectorStrokeShape | null =>
  (node.strokeWidth ?? 0) > 0 ? [getAlignedLoopStrokeShape(node, getPolygonWorldPoints(node), false)] : null;

export const getPolygonStrokeShapes = (node: TPolygonNode): TVectorStrokeShape | null => {
  if (!cache.has(node)) {
    cache.set(node, computePolygonStrokeShapes(node));
  }

  return cache.get(node) ?? null;
};
