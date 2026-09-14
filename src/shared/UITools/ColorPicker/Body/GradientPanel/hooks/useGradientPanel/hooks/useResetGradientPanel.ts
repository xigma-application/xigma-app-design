import { Dispatch, SetStateAction } from 'react';

// others
import { DEFAULT_GRADIENT_STOPS, DEFAULT_GRADIENT_TYPE } from '../../../constants';

// types
import { TEditableGradientStop, TGradientType } from '../../../types';
import { TGradientPoints } from './useRotateGradient';

export const useResetGradientPanel = (
  setStops: Dispatch<SetStateAction<TEditableGradientStop[]>>,
  setSelectedStopId: Dispatch<SetStateAction<string | null>>,
  setAngle: Dispatch<SetStateAction<number>>,
  setPoints: Dispatch<SetStateAction<TGradientPoints | null>>,
  setType: Dispatch<SetStateAction<TGradientType>>,
): TFunc => {
  return (): void => {
    setStops(DEFAULT_GRADIENT_STOPS);
    setSelectedStopId(null);
    setAngle(0);
    setPoints(null);
    setType(DEFAULT_GRADIENT_TYPE);
  };
};
