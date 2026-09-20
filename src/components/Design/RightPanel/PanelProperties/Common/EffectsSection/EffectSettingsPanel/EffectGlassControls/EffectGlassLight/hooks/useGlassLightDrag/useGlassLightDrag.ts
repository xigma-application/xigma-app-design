import { PointerEvent as ReactPointerEvent, RefObject, useRef } from 'react';

// utils
import { getGlassLightAngle } from '../../utils/getGlassLightAngle';

export type TUseGlassLightDragOptions = {
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
};

export type TUseGlassLightDragResult = {
  onPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  ref: RefObject<HTMLDivElement | null>;
};

export const useGlassLightDrag = ({ onChange, onDragEnd, onDragStart }: TUseGlassLightDragOptions): TUseGlassLightDragResult => {
  const ref = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updateAngle = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const rect = ref.current?.getBoundingClientRect();

    if (rect) {
      onChange(getGlassLightAngle(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2)));
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    isDraggingRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onDragStart?.();
    updateAngle(event);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (isDraggingRef.current) {
      updateAngle(event);
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      onDragEnd?.();
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp, ref };
};
