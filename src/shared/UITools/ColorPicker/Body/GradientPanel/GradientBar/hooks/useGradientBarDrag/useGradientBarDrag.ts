import { PointerEvent as ReactPointerEvent, RefObject, useCallback, useEffect, useRef } from 'react';

// types
import { TEditableGradientStop } from '../../../types';

// utils
import { findStopNearClientX } from './utils/findStopNearClientX';
import { getPositionFromClientX } from '../../utils/getPositionFromClientX';

export type TThumbPointerHandlers = {
  onPointerDown: TFunc<[ReactPointerEvent<HTMLButtonElement>]>;
};

export type TUseGradientBarDragResult = {
  barRef: RefObject<HTMLDivElement | null>;
  getThumbHandlers: (stopId: string) => TThumbPointerHandlers;
  onTrackPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
};

export type TUseGradientBarDragOptions = {
  onAddStop: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onMoveStop: TFunc<[string, number]>;
  onSelectStop: TFunc<[string]>;
  stops: TEditableGradientStop[];
};

export const useGradientBarDrag = ({
  onAddStop,
  onDragEnd,
  onDragStart,
  onMoveStop,
  onSelectStop,
  stops,
}: TUseGradientBarDragOptions): TUseGradientBarDragResult => {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingStopIdRef = useRef<string | null>(null);

  const handleWindowPointerMove = useCallback(
    (event: PointerEvent): void => {
      const bar = barRef.current;
      const stopId = draggingStopIdRef.current;

      if (bar && stopId) {
        onMoveStop(stopId, getPositionFromClientX(event.clientX, bar));
      }
    },
    [onMoveStop],
  );

  const handleWindowPointerEnd = useCallback((): void => {
    if (draggingStopIdRef.current) {
      draggingStopIdRef.current = null;
      onDragEnd?.();
    }
  }, [onDragEnd]);

  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const bar = barRef.current;

    if (bar && event.target === event.currentTarget) {
      const nearbyStop = findStopNearClientX(stops, event.clientX, bar);

      if (nearbyStop) {
        onSelectStop(nearbyStop.id);
      } else {
        onAddStop(getPositionFromClientX(event.clientX, bar));
      }
    }
  };

  const getThumbHandlers = (stopId: string): TThumbPointerHandlers => ({
    onPointerDown: (event): void => {
      event.stopPropagation();
      draggingStopIdRef.current = stopId;
      onSelectStop(stopId);
      onDragStart?.();
    },
  });

  useEffect(() => {
    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerEnd);
    window.addEventListener('pointercancel', handleWindowPointerEnd);

    return (): void => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerEnd);
      window.removeEventListener('pointercancel', handleWindowPointerEnd);
    };
  }, [handleWindowPointerEnd, handleWindowPointerMove]);

  return { barRef, getThumbHandlers, onTrackPointerDown };
};
