// types
import { TFrameNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

export const getAutoLayoutFrameCenter = (frame: Pick<TFrameNode, 'height' | 'width' | 'x' | 'y'>): TPoint => ({
  x: frame.x + frame.width / 2,
  y: frame.y + frame.height / 2,
});
