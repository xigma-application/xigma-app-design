import { PointerEvent as ReactPointerEvent } from 'react';

export type TScrollAxis = 'x' | 'y';

export type TAxisProps = {
  client: 'clientHeight' | 'clientWidth';
  coord: 'clientX' | 'clientY';
  scrollPos: 'scrollLeft' | 'scrollTop';
  scrollSize: 'scrollHeight' | 'scrollWidth';
};

export type TScrollMetrics = {
  sizeRatio: number;
  startRatio: number;
};

export type TUseScrollThumbResult = {
  onPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  thumbSizeRatio: number;
  thumbStartRatio: number;
};
