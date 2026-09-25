// types
import { StrokeAlign } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TStarNode } from 'types/design/types';
import { TLineStrokeShape } from '../line/types';
import { TPoint } from 'types/canvas';

// utils
import { getAlignedStrokeBand } from './getAlignedStrokeBand';
import { getAlignedStrokeMidline } from './getAlignedStrokeMidline';
import { getVectorModeStrokePolygons } from '../vector/stroke/getVectorModeStrokePolygons';

export const getAlignedLoopStrokeShape = (
  node: TEllipseNode | TPolygonNode | TStarNode,
  points: TPoint[],
  isHole: boolean,
): TLineStrokeShape => {
  const strokeWidth = node.strokeWidth ?? 0;
  const align = node.strokeAlign ?? StrokeAlign.inside;
  const modePolygons = getVectorModeStrokePolygons(node, getAlignedStrokeMidline(points, strokeWidth / 2, align, isHole));

  return { fillRule: 'evenOdd', polygons: modePolygons ?? getAlignedStrokeBand(points, isHole, align, strokeWidth) };
};
