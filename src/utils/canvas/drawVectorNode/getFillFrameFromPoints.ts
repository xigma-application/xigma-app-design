// types
import { TBoxFillRotation } from './drawVectorPatternSourceTile';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getPointsBounds } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getPointsBounds';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getFillFrameFromPoints = (points: TPoint[], degrees: number): TBoxFillRotation => {
  const bounds = getPointsBounds(points) as TDraftRect;
  const pivot = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const frame = getPointsBounds(points.map((point) => rotatePoint(point, pivot, -degrees))) as TDraftRect;
  const center = rotatePoint({ x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 }, pivot, degrees);

  return { center, degrees, localBounds: { ...frame, x: center.x - frame.width / 2, y: center.y - frame.height / 2 } };
};
