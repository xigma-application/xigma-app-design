// types
import { TAutoLayoutGapAxis } from './types';
import { TDraftRect } from 'types/canvas';

export const buildAutoLayoutGapRect = (
  axis: TAutoLayoutGapAxis,
  primaryStart: number,
  primaryEnd: number,
  bandStart: number,
  bandEnd: number,
): TDraftRect =>
  axis === 'x'
    ? { height: bandEnd - bandStart, width: primaryEnd - primaryStart, x: primaryStart, y: bandStart }
    : { height: primaryEnd - primaryStart, width: bandEnd - bandStart, x: bandStart, y: primaryStart };
