// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getEllipseArcHandlePosition } from './getEllipseArcHandlePosition';

export const getEllipseArcRotateHandlePosition = (
  bounds: TDraftRect,
  arcStartAngle: number,
  flipX = false,
  flipY = false,
  arcRatio = 0,
): TPoint => getEllipseArcHandlePosition(bounds, arcStartAngle, flipX, flipY, arcRatio);
