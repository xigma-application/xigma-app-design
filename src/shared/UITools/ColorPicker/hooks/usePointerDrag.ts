import { PointerEvent as ReactPointerEvent, RefObject, useRef } from 'react';

// utils
import { clamp } from 'utils/math/clamp';

export type TPointerDragPosition = { x: number; y: number };

export type TUsePointerDragOptions = {
  axis?: 'both' | 'x';
  onChange: TFunc<[TPointerDragPosition]>;
};

export type TUsePointerDragResult = {
  onPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  trackRef: RefObject<HTMLDivElement | null>;
};

const getPositionFromEvent = (
  event: ReactPointerEvent<HTMLDivElement>,
  track: HTMLDivElement,
  axis: 'both' | 'x',
): TPointerDragPosition => {
  const rect = track.getBoundingClientRect();
  const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const y = axis === 'both' ? clamp((event.clientY - rect.top) / rect.height, 0, 1) : 0;

  return { x, y };
};

export const usePointerDrag = ({ axis = 'x', onChange }: TUsePointerDragOptions): TUsePointerDragResult => {
  const trackRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const track = trackRef.current;

    if (track) {
      event.currentTarget.setPointerCapture(event.pointerId);
      onChange(getPositionFromEvent(event, track, axis));
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const track = trackRef.current;

    if (track && event.buttons === 1) {
      onChange(getPositionFromEvent(event, track, axis));
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return { onPointerDown, onPointerMove, onPointerUp, trackRef };
};
