// types
import { TAutoLayoutGapAxis } from './types';
import { TDraftRect } from 'types/canvas';

export const getAxisStart = (bound: TDraftRect, axis: TAutoLayoutGapAxis): number => (axis === 'x' ? bound.x : bound.y);

export const getAxisEnd = (bound: TDraftRect, axis: TAutoLayoutGapAxis): number =>
  axis === 'x' ? bound.x + bound.width : bound.y + bound.height;
