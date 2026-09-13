import { nanoid } from '@reduxjs/toolkit';
import { Dispatch, SetStateAction } from 'react';

// others
import { MAX_STOPS } from '../../../constants';

// types
import { TEditableGradientStop, TGradientPanelChange, TGradientType } from '../../../types';
import { TGradientPoints } from './useRotateGradient';

export const useAddStop = (
  stops: TEditableGradientStop[],
  setStops: Dispatch<SetStateAction<TEditableGradientStop[]>>,
  selectStop: TFunc<[string]>,
  type: TGradientType,
  angle: number,
  points: TGradientPoints | null,
  onChange?: TFunc<[TGradientPanelChange]>,
): TFunc<[number]> => {
  return (position: number): void => {
    if (stops.length < MAX_STOPS) {
      const nearestStop = stops.reduce((nearest, stop) =>
        Math.abs(stop.position - position) < Math.abs(nearest.position - position) ? stop : nearest,
      );
      const stop: TEditableGradientStop = { color: nearestStop.color, id: nanoid(), opacity: nearestStop.opacity, position };
      const nextStops = [...stops, stop].sort((a, b) => a.position - b.position);

      setStops(nextStops);
      selectStop(stop.id);
      onChange?.({ angle, end: points?.end, start: points?.start, stops: nextStops, type });
    }
  };
};
