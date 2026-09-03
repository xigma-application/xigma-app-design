// types
import { RefObject } from 'react';

export type TScrollbarAxis = 'x' | 'y';

export type TScrollbarElementRefs = {
  horizontalThumbRef: RefObject<HTMLDivElement | null>;
  horizontalTrackRef: RefObject<HTMLDivElement | null>;
  verticalThumbRef: RefObject<HTMLDivElement | null>;
  verticalTrackRef: RefObject<HTMLDivElement | null>;
};
