import { useState } from 'react';

// others
import { ANGLE_STEP, DEFAULT_GRADIENT_STOPS, DEFAULT_GRADIENT_TYPE, MIN_STOPS } from '../constants';

// types
import { TColorPickerValue } from '../../../types';
import { TEditableGradientStop, TGradientType } from '../types';

// utils
import { createEditableStop } from '../utils/createEditableStop';

export type TUseGradientPanelResult = {
  addStop: TFunc<[number]>;
  angle: number;
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

export const useGradientPanel = (): TUseGradientPanelResult => {
  const [stops, setStops] = useState(DEFAULT_GRADIENT_STOPS);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [type, setType] = useState<TGradientType>(DEFAULT_GRADIENT_TYPE);

  const selectStop = (id: string): void => setSelectedStopId(id);

  const addStop = (position: number): void => {
    const nearestStop = findNearestStop(stops, position);
    const stop = createEditableStop(position, nearestStop.color, nearestStop.opacity);

    setStops((prevStops) => sortByPosition([...prevStops, stop]));
    selectStop(stop.id);
  };

  const removeStop = (id: string): void => {
    if (stops.length > MIN_STOPS) {
      setStops((prevStops) => prevStops.filter((stop) => stop.id !== id));

      if (selectedStopId === id) {
        setSelectedStopId(null);
      }
    }
  };

  const setStopPosition = (id: string, position: number): void => {
    setStops((prevStops) => sortByPosition(prevStops.map((stop) => (stop.id === id ? { ...stop, position } : stop))));
  };

  const setStopColor = (id: string, value: TColorPickerValue): void => {
    setStops((prevStops) => prevStops.map((stop) => (stop.id === id ? { ...stop, color: value.hex, opacity: value.alpha } : stop)));
  };

  const flip = (): void => {
    setStops((prevStops) => sortByPosition(prevStops.map((stop) => ({ ...stop, position: 1 - stop.position }))));
  };

  const rotate = (): void => setAngle((prevAngle) => (prevAngle + ANGLE_STEP) % 360);

  return {
    addStop,
    angle,
    canRemoveStop: stops.length > MIN_STOPS,
    flip,
    removeStop,
    rotate,
    selectStop,
    selectedStopId,
    setStopColor,
    setStopPosition,
    setType,
    stops,
    type,
  };
};
