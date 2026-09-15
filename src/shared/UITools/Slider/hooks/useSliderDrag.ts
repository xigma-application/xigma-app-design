import { PointerEvent as ReactPointerEvent, RefObject, useRef } from 'react';

// others
import { SLIDER_SNAP_THRESHOLD_PX } from '../constants';

// utils
import { clamp } from 'utils/math/clamp';

export type TUseSliderDragOptions = {
  baseValue?: number;
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

const getValueFromEvent = (
  event: ReactPointerEvent<HTMLDivElement>,
  track: HTMLDivElement,
  min: number,
  max: number,
  baseValue?: number,
): number => {
  const rect = track.getBoundingClientRect();
  const pointerOffset = event.clientX - rect.left;
  const fraction = clamp(pointerOffset / rect.width, 0, 1);
  const value = min + fraction * (max - min);

  if (baseValue !== undefined) {
    const baseOffset = ((baseValue - min) / (max - min)) * rect.width;

    if (Math.abs(pointerOffset - baseOffset) <= SLIDER_SNAP_THRESHOLD_PX) {
      return baseValue;
    }
  }

  return value;
};

export const useSliderDrag = ({ baseValue, max, min, onChange, onDragEnd, onDragStart }: TUseSliderDragOptions): TUseSliderDragResult => {
  const trackRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const track = trackRef.current;

    if (track) {
      event.currentTarget.setPointerCapture(event.pointerId);
      onDragStart?.();
      onChange(getValueFromEvent(event, track, min, max, baseValue));
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const track = trackRef.current;

    if (track && event.buttons === 1) {
      onChange(getValueFromEvent(event, track, min, max, baseValue));
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    onDragEnd?.();
  };

  return { onPointerDown, onPointerMove, onPointerUp, trackRef };
};
