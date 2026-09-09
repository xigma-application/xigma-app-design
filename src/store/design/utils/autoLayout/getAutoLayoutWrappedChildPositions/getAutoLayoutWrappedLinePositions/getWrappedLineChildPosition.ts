// types
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect } from 'types/canvas';

export const getWrappedLineChildPosition = (
  child: TAutoLayoutChildSize,
  isHorizontal: boolean,
  frame: TDraftRect,
  primaryOffset: number,
  counterOffset: number,
  withinLineOffset: number,
): TAutoLayoutChildPosition =>
  isHorizontal
    ? { height: child.height, id: child.id, width: child.width, x: frame.x + primaryOffset, y: frame.y + counterOffset + withinLineOffset }
    : { height: child.height, id: child.id, width: child.width, x: frame.x + counterOffset + withinLineOffset, y: frame.y + primaryOffset };
