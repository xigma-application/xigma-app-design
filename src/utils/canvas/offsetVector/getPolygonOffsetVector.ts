// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TPolygonNode, TStarNode, TVectorNode } from 'types/design/types';

// utils
import { buildClosedVectorLoop } from '../vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';
import { flipPoint } from 'utils/math/flipPoint';
import { getClosedLoopPaintFillData } from '../vectorNetwork/convertShapeToVector/utils/getClosedLoopPaintFillData';
import { getMaxPolygonCornerRadius } from '../cornerRadius/polygon/getMaxPolygonCornerRadius';
import { getMaxStarCornerRadius } from '../cornerRadius/star/getMaxStarCornerRadius';
import { getOffsetPolygon } from '../shapes/getOffsetPolygon';
import { getPolygonPoints } from '../shapes/getPolygonPoints';
import { getStarPoints } from '../shapes/getStarPoints';
import { getShapeVectorStrokeSettings } from '../vectorNetwork/convertShapeToVector/utils/getShapeVectorStrokeSettings';
import { rotatePoint } from 'utils/math/rotatePoint';

const getSharpWorldPoints = (polygon: TPolygonNode | TStarNode): TPoint[] => {
  const center = { x: polygon.x + polygon.width / 2, y: polygon.y + polygon.height / 2 };
  const points =
    polygon.type === NodeType.star ? getStarPoints(polygon, polygon.points, polygon.ratio) : getPolygonPoints(polygon, polygon.sides);

  return points.map((point) => rotatePoint(flipPoint(point, center, polygon.flipX, polygon.flipY), center, polygon.rotation));
};

const getOffsetRadius = (polygon: TPolygonNode | TStarNode, distance: number, join: StrokeJoin): number => {
  const maxRadius =
    polygon.type === NodeType.star
      ? getMaxStarCornerRadius(polygon, polygon.points, polygon.ratio)
      : getMaxPolygonCornerRadius(polygon, polygon.sides);
  const radius = Math.min(Math.max(polygon.cornerRadius ?? 0, 0), maxRadius);

  if (radius > 0) {
    return radius + distance;
  }

  return join === StrokeJoin.round ? distance : 0;
};

export const getPolygonOffsetVector = (polygon: TPolygonNode | TStarNode, distance: number, join: StrokeJoin): TVectorNode => {
  const points = getSharpWorldPoints(polygon);
  const vector: TVectorNode = {
    ...buildClosedVectorLoop(getOffsetPolygon(points, distance) ?? points, getOffsetRadius(polygon, distance, join)),
    defaultFill: polygon.fills,
    filledFaceKeys: [],
    id: polygon.id,
    name: 'Vector',
    parentId: polygon.parentId,
    rotation: 0,
    strokeWidth: 0,
    strokes: [],
    type: NodeType.vector,
    vertexHandleModes: {},
  };
  return { ...vector, ...getClosedLoopPaintFillData(vector, polygon.fills), ...getShapeVectorStrokeSettings(polygon) };
};
