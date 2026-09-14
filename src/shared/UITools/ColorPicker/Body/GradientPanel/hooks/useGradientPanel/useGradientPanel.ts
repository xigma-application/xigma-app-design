import { nanoid } from '@reduxjs/toolkit';
import { RefObject, useRef, useState } from 'react';

// hooks
import { useAddStop } from './hooks/useAddStop';
import { useFlipStops } from './hooks/useFlipStops';
import { useRemoveStop } from './hooks/useRemoveStop';
import { useResetGradientPanel } from './hooks/useResetGradientPanel';
import { useResyncGradientPanelState } from './hooks/useResyncGradientPanelState';
import { useRotateGradient, TGradientPoints } from './hooks/useRotateGradient';
import { useSetGradientType } from './hooks/useSetGradientType';
import { useSetStopColor } from './hooks/useSetStopColor';
import { useSetStopPosition } from './hooks/useSetStopPosition';
import { useSyncGradientPanelWithLivePaint } from './hooks/useSyncGradientPanelWithLivePaint';

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
  reset: TFunc;
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
  isDraggingRef?: RefObject<boolean>,
): TUseGradientPanelResult => {
  const fallbackIsDraggingRef = useRef(false);
  const effectiveIsDraggingRef = isDraggingRef ?? fallbackIsDraggingRef;
  const initialStops = initialGradient ? initialGradient.stops.map((stop) => ({ ...stop, id: nanoid() })) : DEFAULT_GRADIENT_STOPS;
  const initialPoints = initialGradient ? { end: initialGradient.end, start: initialGradient.start } : null;
  const [stops, setStops] = useState(initialStops);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [points, setPoints] = useState<TGradientPoints | null>(initialPoints);
  const [type, setType] = useState<TGradientType>(initialGradient?.type ?? DEFAULT_GRADIENT_TYPE);
  const selectStop = (id: string): void => setSelectedStopId(id);
  const addStop = useAddStop(stops, setStops, selectStop, type, angle, points, onChange);
  const removeStop = useRemoveStop(stops, setStops, selectedStopId, setSelectedStopId, type, angle, points, onChange);
  const setStopPosition = useSetStopPosition(stops, setStops, type, angle, points, onChange);
  const setStopColor = useSetStopColor(stops, setStops, type, angle, points, onChange);
  const flip = useFlipStops(stops, setStops, type, angle, points, onChange);
  const rotate = useRotateGradient(stops, type, angle, setAngle, points, setPoints, onChange);
  const setGradientType = useSetGradientType(setType, setPoints, stops, onChange);
  const reset = useResetGradientPanel(setStops, setSelectedStopId, setAngle, setPoints, setType);

  useResyncGradientPanelState(resetKey, initialGradient, setStops, setSelectedStopId, setAngle, setPoints, setType);
  useSyncGradientPanelWithLivePaint(
    initialGradient,
    effectiveIsDraggingRef,
    stops,
    setStops,
    selectedStopId,
    setSelectedStopId,
    points,
    setPoints,
    type,
    setType,
  );

  return {
    addStop,
    angle,
    canAddStop: stops.length < MAX_STOPS,
    canRemoveStop: stops.length > MIN_STOPS,
    flip,
    removeStop,
    reset,
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
