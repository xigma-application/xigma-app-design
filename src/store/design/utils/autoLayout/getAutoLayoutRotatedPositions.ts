// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutRotatedSlotPosition } from './getAutoLayoutRotatedSlotPosition';

export const getAutoLayoutRotatedPositions = (
  positions: Record<string, TPoint>,
  sizesById: Record<string, Pick<TDraftRect, 'height' | 'width'>>,
  frameCenter: TPoint,
  frameRotation: number,
): Record<string, TPoint> =>
  Object.entries(positions).reduce<Record<string, TPoint>>((rotated, [id, point]) => {
    const size = sizesById[id];

    rotated[id] = size ? getAutoLayoutRotatedSlotPosition(point, size, frameCenter, frameRotation) : point;

    return rotated;
  }, {});
