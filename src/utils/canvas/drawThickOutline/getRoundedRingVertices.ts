// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';

// utils
import { getRingVertices } from '../getRingVertices';
import { getRoundedRectPoints } from '../shapes/getRoundedRectPoints';

export const getRoundedRingVertices = (rect: TDraftRect, cornerRadius: number, outer: number, inner: number = outer): number[] => {
  const outerPoints = getRoundedRectPoints(
    {
      cornerRadius: cornerRadius + outer,
      height: rect.height + outer * 2,
      width: rect.width + outer * 2,
      x: rect.x - outer,
      y: rect.y - outer,
    },
    ROUNDED_RECT_CORNER_SEGMENTS,
  );

  const innerPoints = getRoundedRectPoints(
    {
      cornerRadius: Math.max(cornerRadius - inner, 0),
      height: rect.height - inner * 2,
      width: rect.width - inner * 2,
      x: rect.x + inner,
      y: rect.y + inner,
    },
    ROUNDED_RECT_CORNER_SEGMENTS,
  );

  return getRingVertices(outerPoints, innerPoints);
};
