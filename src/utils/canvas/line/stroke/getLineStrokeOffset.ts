// types
import { StrokeAlign } from 'types/design/enums';
import { TLineFrame } from '../types';
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

export const getLineStrokeOffset = (line: TLineNode, frame: TLineFrame): TPoint => {
  switch (line.strokeAlign) {
    case StrokeAlign.inside:
      return { x: frame.normal.x * frame.halfWidth, y: frame.normal.y * frame.halfWidth };
    case StrokeAlign.outside:
      return { x: -frame.normal.x * frame.halfWidth, y: -frame.normal.y * frame.halfWidth };
    default:
      return { x: 0, y: 0 };
  }
};
