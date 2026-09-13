import { Dispatch, SetStateAction } from 'react';

// others
import { MIN_STOPS } from '../../../constants';

// types
import { TEditableGradientStop, TGradientPanelChange, TGradientType } from '../../../types';
import { TGradientPoints } from './useRotateGradient';

export const useRemoveStop = (
  stops: TEditableGradientStop[],
  setStops: Dispatch<SetStateAction<TEditableGradientStop[]>>,
  selectedStopId: string | null,
  setSelectedStopId: Dispatch<SetStateAction<string | null>>,
  type: TGradientType,
  angle: number,
  points: TGradientPoints | null,
  onChange?: TFunc<[TGradientPanelChange]>,
): TFunc<[string]> => {
  return (id: string): void => {
    if (stops.length > MIN_STOPS) {
      const nextStops = stops.filter((stop) => stop.id !== id);

      setStops(nextStops);

      if (selectedStopId === id) {
        setSelectedStopId(null);
      }

      onChange?.({ angle, end: points?.end, start: points?.start, stops: nextStops, type });
    }
  };
};
