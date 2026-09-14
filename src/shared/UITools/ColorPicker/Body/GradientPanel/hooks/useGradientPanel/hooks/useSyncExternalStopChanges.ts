import { nanoid } from '@reduxjs/toolkit';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

// types
import { TEditableGradientStop, TInitialGradient } from '../../../types';
import { TGradientStop } from 'types/design/paint/types';

export const useSyncExternalStopChanges = (
  initialGradient: TInitialGradient | undefined,
  stops: TEditableGradientStop[],
  setStops: Dispatch<SetStateAction<TEditableGradientStop[]>>,
  setSelectedStopId: Dispatch<SetStateAction<string | null>>,
): void => {
  const initialGradientRef = useRef(initialGradient);
  const stopsRef = useRef(stops);

  initialGradientRef.current = initialGradient;
  stopsRef.current = stops;

  const reconcileExternalStops = (externalStops: TGradientStop[], localStops: TEditableGradientStop[]): TEditableGradientStop[] =>
    externalStops.map((stop) => {
      const matchingLocalStop = localStops.find(
        (localStop) => localStop.position === stop.position && localStop.color === stop.color && localStop.opacity === stop.opacity,
      );

      return matchingLocalStop ?? { ...stop, id: nanoid() };
    });

  useEffect(() => {
    const latestInitialGradient = initialGradientRef.current;
    const latestStops = stopsRef.current;

    if (latestInitialGradient && latestInitialGradient.stops.length !== latestStops.length) {
      const reconciledStops = reconcileExternalStops(latestInitialGradient.stops, latestStops);
      const addedStop = reconciledStops.find((stop) => !latestStops.some((localStop) => localStop.id === stop.id));

      setStops(reconciledStops);

      if (addedStop) {
        setSelectedStopId(addedStop.id);
      }
    }
  }, [initialGradient?.stops.length, setSelectedStopId, setStops]);
};
