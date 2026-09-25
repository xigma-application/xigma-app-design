// types
import { TLineFrame } from '../types';
import { TPoint } from 'types/canvas';

export const getLineFramePoint = (frame: TLineFrame, distance: number, offset: number): TPoint => ({
  x: frame.start.x + frame.unit.x * distance + frame.normal.x * offset,
  y: frame.start.y + frame.unit.y * distance + frame.normal.y * offset,
});
