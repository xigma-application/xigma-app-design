import { nanoid } from '@reduxjs/toolkit';
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from 'react';

// types
import { TEditableGradientStop, TGradientType, TInitialGradient } from '../../../types';
import { TGradientPoints } from './useRotateGradient';
import { TGradientStop } from 'types/design/paint/types';

const reconcileExternalStops = (externalStops: TGradientStop[], localStops: TEditableGradientStop[]): TEditableGradientStop[] =>
  externalStops.map((stop) => {
    const matchingLocalStop = localStops.find(
      (localStop) => localStop.position === stop.position && localStop.color === stop.color && localStop.opacity === stop.opacity,
    );

    return matchingLocalStop ?? { ...stop, id: nanoid() };
  });

const areStopListsEqual = (a: TEditableGradientStop[], b: TEditableGradientStop[]): boolean =>
  a.length === b.length && a.every((stop, index) => stop.id === b[index]?.id);

const arePointsEqual = (a: TGradientPoints | null, end: TInitialGradient['end'], start: TInitialGradient['start']): boolean =>
  a?.start.x === start.x && a?.start.y === start.y && a?.end.x === end.x && a?.end.y === end.y;

export const useSyncGradientPanelWithLivePaint = (
  initialGradient: TInitialGradient | undefined,
  isDraggingRef: RefObject<boolean>,
  stops: TEditableGradientStop[],
  setStops: Dispatch<SetStateAction<TEditableGradientStop[]>>,
  selectedStopId: string | null,
  setSelectedStopId: Dispatch<SetStateAction<string | null>>,
  points: TGradientPoints | null,
  setPoints: Dispatch<SetStateAction<TGradientPoints | null>>,
  type: TGradientType,
  setType: Dispatch<SetStateAction<TGradientType>>,
): void => {
  const stateRef = useRef({ points, selectedStopId, stops, type });

  stateRef.current = { points, selectedStopId, stops, type };

  useEffect(() => {
    if (initialGradient && !isDraggingRef.current) {
      const current = stateRef.current;
      const reconciledStops = reconcileExternalStops(initialGradient.stops, current.stops);

      if (!areStopListsEqual(reconciledStops, current.stops)) {
        setStops(reconciledStops);

        if (current.selectedStopId && !reconciledStops.some((stop) => stop.id === current.selectedStopId)) {
          setSelectedStopId(null);
        }
      }

      if (!arePointsEqual(current.points, initialGradient.end, initialGradient.start)) {
        setPoints({ end: initialGradient.end, start: initialGradient.start });
      }

      if (current.type !== initialGradient.type) {
        setType(initialGradient.type);
      }
    }
  }, [
    initialGradient?.end,
    initialGradient?.start,
    initialGradient?.stops,
    initialGradient?.type,
    isDraggingRef,
    setPoints,
    setSelectedStopId,
    setStops,
    setType,
  ]);
};
