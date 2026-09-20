// types
import { TDrawableRect } from '../drawRect/drawRect';
import { TFrameNode } from 'types/design/types';

export const clampRectToFrameBounds = (rect: TDrawableRect, frame: TFrameNode): TDrawableRect => {
  const left = Math.max(rect.x, frame.x);
  const top = Math.max(rect.y, frame.y);
  const right = Math.min(rect.x + rect.width, frame.x + frame.width);
  const bottom = Math.min(rect.y + rect.height, frame.y + frame.height);

  return { ...rect, height: Math.max(0, bottom - top), width: Math.max(0, right - left), x: left, y: top };
};
