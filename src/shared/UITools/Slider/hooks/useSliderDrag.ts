import { PointerEvent as ReactPointerEvent, RefObject, useRef } from 'react';

// utils
import { clamp } from 'utils/math/clamp';

export type TUseSliderDragOptions = {
  max: number;
  min: number;
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
};

export type TUseSliderDragResult = {
  onPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  trackRef: RefObject<HTMLDivElement | null>;
};

const getValueFromEvent = (event: ReactPointerEvent<HTMLDivElement>, track: HTMLDivElement, min: number, max: number): number => {
  const rect = track.getBoundingClientRect();
  const fraction = clamp((event.clientX - rect.left) / rect.width, 0, 1);

  return min + fraction * (max - min);
};

export const useSliderDrag = ({ max, min, onChange, onDragEnd, onDragStart }: TUseSliderDragOptions): TUseSliderDragResult => {
  const trackRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const track = trackRef.current;

    if (track) {
      event.currentTarget.setPointerCapture(event.pointerId);
      onDragStart?.();
      onChange(getValueFromEvent(event, track, min, max));
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const track = trackRef.current;

    if (track && event.buttons === 1) {
      onChange(getValueFromEvent(event, track, min, max));
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    onDragEnd?.();
  };

  return { onPointerDown, onPointerMove, onPointerUp, trackRef };
};
