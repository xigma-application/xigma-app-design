// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getAutoLayoutRotatedSlotPosition = (
  slotTopLeft: TPoint,
  slotSize: Pick<TDraftRect, 'height' | 'width'>,
  frameCenter: TPoint,
  frameRotation: number,
): TPoint => {
  const slotCenter = { x: slotTopLeft.x + slotSize.width / 2, y: slotTopLeft.y + slotSize.height / 2 };
  const rotatedCenter = rotatePoint(slotCenter, frameCenter, frameRotation);

  return { x: rotatedCenter.x - slotSize.width / 2, y: rotatedCenter.y - slotSize.height / 2 };
};
