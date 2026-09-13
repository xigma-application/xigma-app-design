import { Dispatch, SetStateAction } from 'react';

// types
import { TColorPickerValue } from '../../../../../types';
import { TEditableGradientStop, TGradientPanelChange, TGradientType } from '../../../types';
import { TGradientPoints } from './useRotateGradient';

export const useSetStopColor = (
  stops: TEditableGradientStop[],
  setStops: Dispatch<SetStateAction<TEditableGradientStop[]>>,
  type: TGradientType,
  angle: number,
  points: TGradientPoints | null,
  onChange?: TFunc<[TGradientPanelChange]>,
): TFunc<[string, TColorPickerValue]> => {
  return (id: string, value: TColorPickerValue): void => {
    const nextStops = stops.map((stop) => (stop.id === id ? { ...stop, color: value.hex, opacity: value.alpha } : stop));

    setStops(nextStops);
    onChange?.({ angle, end: points?.end, start: points?.start, stops: nextStops, type });
  };
};
