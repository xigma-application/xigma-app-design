import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { continueShapeCornerRadiusDrag } from './continueShapeCornerRadiusDrag';
import { getMaxPolygonCornerRadius } from 'utils/canvas/cornerRadius/polygon/getMaxPolygonCornerRadius';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';

export const continuePolygonCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
): void =>
  continueShapeCornerRadiusDrag(
    canvas,
    event,
    dispatch,
    polygonCornerRadiusDragRef,
    (dragState, bounds) => getPolygonPoints(bounds, dragState.sides),
    (dragState, bounds) => getMaxPolygonCornerRadius(bounds, dragState.sides),
  );
