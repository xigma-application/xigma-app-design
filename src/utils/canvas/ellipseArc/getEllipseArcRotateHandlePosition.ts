// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseArcFlip } from './types';

// utils
import { getEllipseArcHandlePosition } from './getEllipseArcHandlePosition';

export const getEllipseArcRotateHandlePosition = (
  bounds: TDraftRect,
  arcStartAngle: number,
  flip: TEllipseArcFlip = {},
  arcRatio = 0,
): TPoint => getEllipseArcHandlePosition(bounds, arcStartAngle, flip, arcRatio);
