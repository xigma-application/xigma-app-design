import { nanoid } from '@reduxjs/toolkit';
import { useState } from 'react';

// hooks
import { useAddStop } from './hooks/useAddStop';
import { useFlipStops } from './hooks/useFlipStops';
import { useRemoveStop } from './hooks/useRemoveStop';
import { useResetGradientPanelOnReopen } from './hooks/useResetGradientPanelOnReopen';
import { useRotateGradient, TGradientPoints } from './hooks/useRotateGradient';
import { useSetGradientType } from './hooks/useSetGradientType';
import { useSetStopColor } from './hooks/useSetStopColor';
import { useSetStopPosition } from './hooks/useSetStopPosition';

// others
import { DEFAULT_GRADIENT_STOPS, DEFAULT_GRADIENT_TYPE, MAX_STOPS, MIN_STOPS } from '../../constants';

// types
import { TColorPickerValue } from '../../../../types';
import { TEditableGradientStop, TGradientPanelChange, TGradientType, TInitialGradient } from '../../types';

export type TUseGradientPanelResult = {
  addStop: TFunc<[number]>;
  angle: number;
  canAddStop: boolean;
  canRemoveStop: boolean;
  flip: TFunc;
  removeStop: TFunc<[string]>;
  rotate: TFunc;
  selectStop: TFunc<[string]>;
  selectedStopId: string | null;
  setStopColor: TFunc<[string, TColorPickerValue]>;
  setStopPosition: TFunc<[string, number]>;
  setType: TFunc<[TGradientType]>;
  stops: TEditableGradientStop[];
  type: TGradientType;
};

export const useGradientPanel = (
  onChange?: TFunc<[TGradientPanelChange]>,
  initialGradient?: TInitialGradient,
  resetKey?: number,
): TUseGradientPanelResult => {
  const initialStops = initialGradient ? initialGradient.stops.map((stop) => ({ ...stop, id: nanoid() })) : DEFAULT_GRADIENT_STOPS;
  const initialPoints = initialGradient ? { end: initialGradient.end, start: initialGradient.start } : null;
  const [stops, setStops] = useState(initialStops);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [points, setPoints] = useState<TGradientPoints | null>(initialPoints);
  const [type, setType] = useState<TGradientType>(DEFAULT_GRADIENT_TYPE);
  const selectStop = (id: string): void => setSelectedStopId(id);
  const addStop = useAddStop(stops, setStops, selectStop, type, angle, points, onChange);
  const removeStop = useRemoveStop(stops, setStops, selectedStopId, setSelectedStopId, type, angle, points, onChange);
  const setStopPosition = useSetStopPosition(stops, setStops, type, angle, points, onChange);
  const setStopColor = useSetStopColor(stops, setStops, type, angle, points, onChange);
  const flip = useFlipStops(stops, setStops, type, angle, points, onChange);
  const rotate = useRotateGradient(stops, type, angle, setAngle, points, setPoints, onChange);
  const setGradientType = useSetGradientType(setType, stops, angle, points, onChange);

  useResetGradientPanelOnReopen(resetKey, initialGradient, setStops, setSelectedStopId, setAngle, setPoints, setType);

  return {
    addStop,
    angle,
    canAddStop: stops.length < MAX_STOPS,
    canRemoveStop: stops.length > MIN_STOPS,
    flip,
    removeStop,
    rotate,
    selectStop,
    selectedStopId,
    setStopColor,
    setStopPosition,
    setType: setGradientType,
    stops,
    type,
  };
};
