// types
import { TDraftRect } from 'types/canvas';

// utils
import { getMaxCornerRadiusForVertices } from 'utils/canvas/cornerRadius/getMaxCornerRadiusForVertices';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';

export const getMaxPolygonCornerRadius = (bounds: TDraftRect, sides: number): number =>
  getMaxCornerRadiusForVertices(getPolygonPoints(bounds, sides));
