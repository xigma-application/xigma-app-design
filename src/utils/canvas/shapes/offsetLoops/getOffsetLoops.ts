// types
import { TPoint } from 'types/canvas';

// utils
import { getPositiveWindingLoops } from './getPositiveWindingLoops';
import { getRawOffsetLoop } from './getRawOffsetLoop';
import { getVectorFaceSignedArea } from '../../vectorNetwork/getVectorFaceSignedArea';
import { removeCollinearPoints } from './removeCollinearPoints';

const EPSILON = 1e-9;

export const getOffsetLoops = (points: TPoint[], distance: number): TPoint[][] => {
  const cleaned = points.filter((point, index) => {
    const next = points[(index + 1) % points.length];
    return Math.hypot(next.x - point.x, next.y - point.y) > EPSILON;
  });
  const sign = Math.sign(getVectorFaceSignedArea(cleaned));

  if (cleaned.length >= 3 && sign !== 0) {
    return getPositiveWindingLoops(getRawOffsetLoop(cleaned, distance, sign), sign)
      .map((loop) => removeCollinearPoints(sign > 0 ? loop : [...loop].reverse()))
      .filter((loop) => loop.length >= 3 && Math.abs(getVectorFaceSignedArea(loop)) > EPSILON);
  }

  return [];
};
