// types
import { RefObject } from 'react';

export type TScrollbarAxis = 'x' | 'y';

export type TScrollbarElementRefs = {
  horizontalThumbRef: RefObject<HTMLDivElement | null>;
  horizontalTrackRef: RefObject<HTMLDivElement | null>;
  verticalThumbRef: RefObject<HTMLDivElement | null>;
  verticalTrackRef: RefObject<HTMLDivElement | null>;
};

export type TScrollbarDragRefs = {
  x: RefObject<boolean>;
  y: RefObject<boolean>;
};

export type TFrozenAxisRange = { rangeLength: number } | null;

export type TFrozenRangeRefs = {
  x: RefObject<TFrozenAxisRange>;
  y: RefObject<TFrozenAxisRange>;
};
