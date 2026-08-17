// types
import { TDraftRect } from 'types/canvas';

// utils
import { getMaxCornerRadiusForVertices } from 'utils/canvas/cornerRadius/getMaxCornerRadiusForVertices';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';

export const getMaxStarCornerRadius = (bounds: TDraftRect, points: number, ratio: number): number =>
  getMaxCornerRadiusForVertices(getStarPoints(bounds, points, ratio));
