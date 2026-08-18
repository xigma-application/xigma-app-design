import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TStarCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { continueShapeCornerRadiusDrag } from './continueShapeCornerRadiusDrag';
import { getMaxStarCornerRadius } from 'utils/canvas/cornerRadius/star/getMaxStarCornerRadius';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';

export const continueStarCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
): void =>
  continueShapeCornerRadiusDrag(
    canvas,
    event,
    dispatch,
    starCornerRadiusDragRef,
    (dragState, bounds) => getStarPoints(bounds, dragState.points, dragState.ratio),
    (dragState, bounds) => getMaxStarCornerRadius(bounds, dragState.points, dragState.ratio),
  );
