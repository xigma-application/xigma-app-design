// types
import { TAutoLayoutFrame } from './types';
import { TPoint } from 'types/canvas';

// utils
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';
import { isPointInRect } from 'components/Design/Canvas/utils/isPointInRect';

export const isPointInsideFrame = (point: TPoint, frame: TAutoLayoutFrame): boolean => {
  const bounds = { height: frame.height, width: frame.width, x: frame.x, y: frame.y };

  return isPointInRect(getUnrotatedQueryPoint(point, bounds, frame.rotation), bounds);
};
