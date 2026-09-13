import { useState } from 'react';

// others
import { ANGLE_STEP, DEFAULT_GRADIENT_STOPS, DEFAULT_GRADIENT_TYPE, MAX_STOPS, MIN_STOPS } from '../constants';

// types
import { TColorPickerValue } from '../../../types';
import { TEditableGradientStop, TGradientPanelChange, TGradientType } from '../types';

// utils
import { createEditableStop } from '../utils/createEditableStop';

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

const sortByPosition = (stops: TEditableGradientStop[]): TEditableGradientStop[] => [...stops].sort((a, b) => a.position - b.position);

const findNearestStop = (stops: TEditableGradientStop[], position: number): TEditableGradientStop =>
  stops.reduce((nearest, stop) => (Math.abs(stop.position - position) < Math.abs(nearest.position - position) ? stop : nearest));

export const useGradientPanel = (onChange?: TFunc<[TGradientPanelChange]>): TUseGradientPanelResult => {
  const [stops, setStops] = useState(DEFAULT_GRADIENT_STOPS);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [type, setType] = useState<TGradientType>(DEFAULT_GRADIENT_TYPE);

  const notifyChange = (nextStops: TEditableGradientStop[], nextType: TGradientType, nextAngle: number): void => {
    onChange?.({ angle: nextAngle, stops: nextStops, type: nextType });
  };

  const selectStop = (id: string): void => setSelectedStopId(id);

  const addStop = (position: number): void => {
    if (stops.length < MAX_STOPS) {
      const nearestStop = findNearestStop(stops, position);
      const stop = createEditableStop(position, nearestStop.color, nearestStop.opacity);
      const nextStops = sortByPosition([...stops, stop]);

      setStops(nextStops);
      selectStop(stop.id);
      notifyChange(nextStops, type, angle);
    }
  };

  const removeStop = (id: string): void => {
    if (stops.length > MIN_STOPS) {
      const nextStops = stops.filter((stop) => stop.id !== id);

      setStops(nextStops);

      if (selectedStopId === id) {
        setSelectedStopId(null);
      }

      notifyChange(nextStops, type, angle);
    }
  };

  const setStopPosition = (id: string, position: number): void => {
    const nextStops = sortByPosition(stops.map((stop) => (stop.id === id ? { ...stop, position } : stop)));

    setStops(nextStops);
    notifyChange(nextStops, type, angle);
  };

  const setStopColor = (id: string, value: TColorPickerValue): void => {
    const nextStops = stops.map((stop) => (stop.id === id ? { ...stop, color: value.hex, opacity: value.alpha } : stop));

    setStops(nextStops);
    notifyChange(nextStops, type, angle);
  };

  const flip = (): void => {
    const nextStops = sortByPosition(stops.map((stop) => ({ ...stop, position: 1 - stop.position })));

    setStops(nextStops);
    notifyChange(nextStops, type, angle);
  };

  const rotate = (): void => {
    const nextAngle = (angle + ANGLE_STEP) % 360;

    setAngle(nextAngle);
    notifyChange(stops, type, nextAngle);
  };

  const handleSetType = (nextType: TGradientType): void => {
    setType(nextType);
    notifyChange(stops, nextType, angle);
  };

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
    setType: handleSetType,
    stops,
    type,
  };
};
