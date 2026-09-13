import { Dispatch, SetStateAction } from 'react';

// types
import { TEditableGradientStop, TGradientPanelChange, TGradientType } from '../../../types';
import { TGradientPoints } from './useRotateGradient';

export const useFlipStops = (
  stops: TEditableGradientStop[],
  setStops: Dispatch<SetStateAction<TEditableGradientStop[]>>,
  type: TGradientType,
  angle: number,
  points: TGradientPoints | null,
  onChange?: TFunc<[TGradientPanelChange]>,
): TFunc => {
  return (): void => {
    const nextStops = stops.map((stop) => ({ ...stop, position: 1 - stop.position })).sort((a, b) => a.position - b.position);

    setStops(nextStops);
    onChange?.({ angle, end: points?.end, start: points?.start, stops: nextStops, type });
  };
};
