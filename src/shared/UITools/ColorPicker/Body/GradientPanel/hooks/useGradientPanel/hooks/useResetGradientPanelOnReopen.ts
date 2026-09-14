import { nanoid } from '@reduxjs/toolkit';
import { Dispatch, SetStateAction, useLayoutEffect, useRef } from 'react';

// others
import { DEFAULT_GRADIENT_STOPS, DEFAULT_GRADIENT_TYPE } from '../../../constants';

// types
import { TEditableGradientStop, TGradientType, TInitialGradient } from '../../../types';
import { TGradientPoints } from './useRotateGradient';

export const useResetGradientPanelOnReopen = (
  resetKey: number | undefined,
  initialGradient: TInitialGradient | undefined,
  setStops: Dispatch<SetStateAction<TEditableGradientStop[]>>,
  setSelectedStopId: Dispatch<SetStateAction<string | null>>,
  setAngle: Dispatch<SetStateAction<number>>,
  setPoints: Dispatch<SetStateAction<TGradientPoints | null>>,
  setType: Dispatch<SetStateAction<TGradientType>>,
): void => {
  const initialGradientRef = useRef(initialGradient);
  const isFirstRunRef = useRef(true);

  initialGradientRef.current = initialGradient;

  useLayoutEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
    } else {
      const seed = initialGradientRef.current;

      setStops(seed ? seed.stops.map((stop) => ({ ...stop, id: nanoid() })) : DEFAULT_GRADIENT_STOPS);
      setSelectedStopId(null);
      setAngle(0);
      setPoints(seed ? { end: seed.end, start: seed.start } : null);
      setType(seed?.type ?? DEFAULT_GRADIENT_TYPE);
    }
  }, [resetKey]);
};
