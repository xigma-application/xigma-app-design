// types
import { TDraftRect, TPoint } from 'types/canvas';

const MOVE_SNAP_TOLERANCE_PX = 6;
const SNAP_LANDMARKS = [0, 0.5, 1];

export type TGradientMoveSnapResult = {
  point: TPoint;
  snappedX: boolean;
  snappedY: boolean;
};

const snapAxis = (value: number, tolerance: number): { snapped: boolean; value: number } => {
  const landmark = SNAP_LANDMARKS.find((candidate) => Math.abs(value - candidate) <= tolerance);
  return landmark === undefined ? { snapped: false, value } : { snapped: true, value: landmark };
};

export const getGradientMoveSnapPoint = (normalizedPoint: TPoint, bounds: TDraftRect, zoom: number): TGradientMoveSnapResult => {
  const toleranceX = MOVE_SNAP_TOLERANCE_PX / zoom / bounds.width;
  const toleranceY = MOVE_SNAP_TOLERANCE_PX / zoom / bounds.height;
  const x = snapAxis(normalizedPoint.x, toleranceX);
  const y = snapAxis(normalizedPoint.y, toleranceY);

  return { point: { x: x.value, y: y.value }, snappedX: x.snapped, snappedY: y.snapped };
};
