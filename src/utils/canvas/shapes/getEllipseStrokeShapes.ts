// types
import { StrokeAlign } from 'types/design/enums';
import { TLineStrokeShape } from '../line/types';
import { TPoint } from 'types/canvas';
import { TEllipseNode } from 'types/design/types';
import { TEllipseStrokeLoop, getEllipseStrokeLoops } from './getEllipseStrokeLoops';
import { TVectorStrokeShape } from '../vector/stroke/types';

// utils
import { getAlignedStrokeMidline } from './getAlignedStrokeMidline';
import { getOffsetPolygon } from './getOffsetPolygon';
import { getVectorModeStrokePolygons } from '../vector/stroke/getVectorModeStrokePolygons';

const cache = new WeakMap<TEllipseNode, TVectorStrokeShape | null>();

const getBandDistances = (align: StrokeAlign, strokeWidth: number): [number, number] => {
  switch (align) {
    case StrokeAlign.center:
      return [strokeWidth / 2, strokeWidth / 2];
    case StrokeAlign.outside:
      return [strokeWidth, 0];
    default:
      return [0, strokeWidth];
  }
};

const getBandEdge = (points: TPoint[], distance: number): TPoint[] | null => (distance === 0 ? points : getOffsetPolygon(points, distance));

const getUniformBand = (loop: TEllipseStrokeLoop, align: StrokeAlign, strokeWidth: number): TPoint[][] => {
  const towardShape = loop.isHole ? 1 : -1;
  const [awayDistance, towardDistance] = getBandDistances(align, strokeWidth);

  return [getBandEdge(loop.points, -towardShape * awayDistance), getBandEdge(loop.points, towardShape * towardDistance)].filter(
    (edge): edge is TPoint[] => edge !== null,
  );
};

const getLoopShape = (node: TEllipseNode, loop: TEllipseStrokeLoop, strokeWidth: number): TLineStrokeShape => {
  const align = node.strokeAlign ?? StrokeAlign.inside;
  const modePolygons = getVectorModeStrokePolygons(node, getAlignedStrokeMidline(loop.points, strokeWidth / 2, align, loop.isHole));

  return { fillRule: 'evenOdd', polygons: modePolygons ?? getUniformBand(loop, align, strokeWidth) };
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
