import { Dispatch, SetStateAction } from 'react';

// types
import { TEditableGradientStop, TGradientPanelChange, TGradientType } from '../../../types';
import { TGradientPoints } from './useRotateGradient';

export const useSetGradientType = (
  setType: Dispatch<SetStateAction<TGradientType>>,
  stops: TEditableGradientStop[],
  angle: number,
  points: TGradientPoints | null,
  onChange?: TFunc<[TGradientPanelChange]>,
): TFunc<[TGradientType]> => {
  return (nextType: TGradientType): void => {
    setType(nextType);
    onChange?.({ angle, end: points?.end, start: points?.start, stops, type: nextType });
  };
};
