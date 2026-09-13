import { PointerEvent as ReactPointerEvent, RefObject, useRef } from 'react';

// types
import { TEditableGradientStop } from '../../types';

// utils
import { getPositionFromClientX } from '../utils/getPositionFromClientX';

export type TThumbPointerHandlers = {
  onPointerDown: TFunc<[ReactPointerEvent<HTMLButtonElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLButtonElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLButtonElement>]>;
};

export type TUseGradientBarDragResult = {
  barRef: RefObject<HTMLDivElement | null>;
  getThumbHandlers: (stopId: string) => TThumbPointerHandlers;
  onTrackPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
};

export type TUseGradientBarDragOptions = {
  onAddStop: TFunc<[number]>;
  onMoveStop: TFunc<[string, number]>;
  onSelectStop: TFunc<[string]>;
  stops: TEditableGradientStop[];
};

const STOP_HIT_RADIUS_PX = 10;

const findStopNearClientX = (stops: TEditableGradientStop[], clientX: number, bar: HTMLDivElement): TEditableGradientStop | undefined => {
  const rect = bar.getBoundingClientRect();

  return stops.find((stop) => Math.abs(clientX - (rect.left + stop.position * rect.width)) <= STOP_HIT_RADIUS_PX);
};

export const useGradientBarDrag = ({
  onAddStop,
  onMoveStop,
  onSelectStop,
  stops,
}: TUseGradientBarDragOptions): TUseGradientBarDragResult => {
  const barRef = useRef<HTMLDivElement>(null);

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
      event.currentTarget.setPointerCapture(event.pointerId);
      onSelectStop(stopId);
    },
    onPointerMove: (event): void => {
      const bar = barRef.current;

      if (bar && event.buttons === 1) {
        onMoveStop(stopId, getPositionFromClientX(event.clientX, bar));
      }
    },
    onPointerUp: (event): void => {
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
  });

  return { barRef, getThumbHandlers, onTrackPointerDown };
};
