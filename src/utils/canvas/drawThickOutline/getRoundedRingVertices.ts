// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';

// utils
import { getRingVertices } from '../getRingVertices';
import { getRoundedRectPoints } from '../shapes/getRoundedRectPoints';

export const getRoundedRingVertices = (rect: TDraftRect, halfWidth: number, cornerRadius: number): number[] => {
  const outerPoints = getRoundedRectPoints(
    { cornerRadius, height: rect.height + halfWidth * 2, width: rect.width + halfWidth * 2, x: rect.x - halfWidth, y: rect.y - halfWidth },
    ROUNDED_RECT_CORNER_SEGMENTS,
  );

  const innerPoints = getRoundedRectPoints(
    { cornerRadius, height: rect.height - halfWidth * 2, width: rect.width - halfWidth * 2, x: rect.x + halfWidth, y: rect.y + halfWidth },
    ROUNDED_RECT_CORNER_SEGMENTS,
  );

  return getRingVertices(outerPoints, innerPoints);
};
