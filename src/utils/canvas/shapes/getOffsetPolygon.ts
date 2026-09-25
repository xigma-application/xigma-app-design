// types
import { TPoint } from 'types/canvas';

// utils
import { getOffsetLoops } from './offsetLoops/getOffsetLoops';
import { getVectorFaceSignedArea } from '../vectorNetwork/getVectorFaceSignedArea';

export const getOffsetPolygon = (points: TPoint[], distance: number): TPoint[] | null =>
  getOffsetLoops(points, distance).reduce<TPoint[] | null>(
    (largest, loop) => (!largest || Math.abs(getVectorFaceSignedArea(loop)) > Math.abs(getVectorFaceSignedArea(largest)) ? loop : largest),
    null,
  );
