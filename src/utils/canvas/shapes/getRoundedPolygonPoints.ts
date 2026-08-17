// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxPolygonCornerRadius } from 'utils/canvas/cornerRadius/polygon/getMaxPolygonCornerRadius';
import { getPolygonPoints } from './getPolygonPoints';
import { getRoundedVertexPoints } from './getRoundedVertexPoints';

export type TRoundedPolygon = TDraftRect & { cornerRadius: number; sides: number };

export const getRoundedPolygonPoints = (polygon: TRoundedPolygon, segmentsPerVertex: number): TPoint[] => {
  const vertices = getPolygonPoints(polygon, polygon.sides);
  const radius = Math.min(Math.max(polygon.cornerRadius, 0), getMaxPolygonCornerRadius(polygon, polygon.sides));

  return getRoundedVertexPoints(vertices, radius, segmentsPerVertex);
};
