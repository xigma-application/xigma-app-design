// types
import { TDraftRect, TPoint } from 'types/canvas';

export type TAutoLayoutPaddingSide = 'bottom' | 'left' | 'right' | 'top';

export type TAutoLayoutPaddingHandle = {
  band: TDraftRect;
  handleCenter: TPoint;
  side: TAutoLayoutPaddingSide;
  value: number;
};

export type TAutoLayoutPaddingHandles = Record<TAutoLayoutPaddingSide, TAutoLayoutPaddingHandle>;

export type TAutoLayoutPaddingEditState = {
  frameId: string;
  point: TPoint;
  side: TAutoLayoutPaddingSide;
};
