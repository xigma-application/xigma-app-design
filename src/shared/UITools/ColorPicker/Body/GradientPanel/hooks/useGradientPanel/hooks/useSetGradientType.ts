import { Dispatch, SetStateAction } from 'react';

// types
import { TEditableGradientStop, TGradientPanelChange, TGradientType } from '../../../types';
import { TGradientPoints } from './useRotateGradient';

const getDefaultGradientPoints = (type: TGradientType): TGradientPoints =>
  type === 'gradient-radial' ? { end: { x: 0.5, y: 1 }, start: { x: 0.5, y: 0.5 } } : { end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } };

export const useSetGradientType = (
  setType: Dispatch<SetStateAction<TGradientType>>,
  setPoints: Dispatch<SetStateAction<TGradientPoints | null>>,
  stops: TEditableGradientStop[],
  onChange?: TFunc<[TGradientPanelChange]>,
): TFunc<[TGradientType]> => {
  return (nextType: TGradientType): void => {
    const nextPoints = getDefaultGradientPoints(nextType);

    setType(nextType);
    setPoints(nextPoints);
    onChange?.({ angle: 0, end: nextPoints.end, start: nextPoints.start, stops, type: nextType });
  };
};
