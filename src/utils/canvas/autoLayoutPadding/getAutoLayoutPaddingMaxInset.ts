// types
import { TAutoLayoutPaddingSide } from './types';
import { TDraftRect } from 'types/canvas';

export const getAutoLayoutPaddingMaxInset = (frame: TDraftRect, side: TAutoLayoutPaddingSide): number =>
  side === 'left' || side === 'right' ? frame.width / 2 : frame.height / 2;
