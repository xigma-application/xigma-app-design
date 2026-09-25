// types
import { StrokeAlign } from 'types/design/enums';
import { TLineStrokeShape } from '../line/types';
import { TEllipseNode } from 'types/design/types';
import { TEllipseStrokeLoop, getEllipseStrokeLoops } from './getEllipseStrokeLoops';
import { TVectorStrokeShape } from '../vector/stroke/types';

// utils
import { getAlignedStrokeBand } from './getAlignedStrokeBand';
import { getAlignedStrokeMidline } from './getAlignedStrokeMidline';
import { getVectorModeStrokePolygons } from '../vector/stroke/getVectorModeStrokePolygons';

const cache = new WeakMap<TEllipseNode, TVectorStrokeShape | null>();

const getLoopShape = (node: TEllipseNode, loop: TEllipseStrokeLoop, strokeWidth: number): TLineStrokeShape => {
  const align = node.strokeAlign ?? StrokeAlign.inside;
  const modePolygons = getVectorModeStrokePolygons(node, getAlignedStrokeMidline(loop.points, strokeWidth / 2, align, loop.isHole));

  return { fillRule: 'evenOdd', polygons: modePolygons ?? getAlignedStrokeBand(loop.points, loop.isHole, align, strokeWidth) };
};

const computeEllipseStrokeShapes = (node: TEllipseNode): TVectorStrokeShape | null => {
  const strokeWidth = node.strokeWidth ?? 0;
  return strokeWidth > 0 ? getEllipseStrokeLoops(node).map((loop) => getLoopShape(node, loop, strokeWidth)) : null;
};

export const getEllipseStrokeShapes = (node: TEllipseNode): TVectorStrokeShape | null => {
  if (!cache.has(node)) {
    cache.set(node, computeEllipseStrokeShapes(node));
  }

  return cache.get(node) ?? null;
};
