// types
import { StrokeMode } from 'types/design/enums';
import { TBooleanNode } from 'types/design/types';
import { TBooleanShape } from './types';
import { TPoint } from 'types/canvas';

// utils
import { buildStrokeRing } from '../buildStrokeRing';
import { getBoxBrushStrokePolygons } from '../getBoxBrushStrokePolygons';
import { getBoxDynamicStrokePolygons } from '../getBoxDynamicStrokePolygons';
import { getStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

const cache = new WeakMap<TBooleanNode, { polygons: TPoint[][] | null; shape: TBooleanShape }>();

const getLoopModePolygons = (node: TBooleanNode, loop: TPoint[], strokeWidth: number): TPoint[][] => {
  const { inner, outer } = getStrokeOutlinePolygons(loop, strokeWidth / 2, true);
  const polygons =
    node.strokeMode === StrokeMode.brush
      ? getBoxBrushStrokePolygons(node, buildStrokeRing(outer, inner))
      : getBoxDynamicStrokePolygons(outer, inner, { ...getStrokeDynamicValues(node), seed: node.id, strokeWidth });

  return polygons ?? [outer, inner];
};

const computeModePolygons = (node: TBooleanNode, shape: TBooleanShape, strokeWidth: number): TPoint[][] | null => {
  switch (node.strokeMode) {
    case StrokeMode.brush:
    case StrokeMode.dynamic:
      return shape.polygons.flatMap((loop) => getLoopModePolygons(node, loop, strokeWidth));
    default:
      return null;
  }
};

export const getBooleanStrokeModePolygons = (node: TBooleanNode, shape: TBooleanShape, strokeWidth: number): TPoint[][] | null => {
  const cached = cache.get(node);

  if (cached?.shape === shape) {
    return cached.polygons;
  }

  const polygons = computeModePolygons(node, shape, strokeWidth);

  cache.set(node, { polygons, shape });
  return polygons;
};
