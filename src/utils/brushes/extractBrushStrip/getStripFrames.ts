// types
import { TBrushCenterline } from '../getBrushCenterline/types';
import { TStripFrame } from './types';

// others
import { MIN_STRIP_LENGTH } from './constants';

// utils
import { getStripFrame } from './getStripFrame';

export const getStripFrames = (centerline: TBrushCenterline, arc: number[]): TStripFrame[] =>
  Array.from({ length: Math.max(MIN_STRIP_LENGTH, Math.floor(arc[arc.length - 1])) }, (_, step) => getStripFrame(centerline, arc, step));
