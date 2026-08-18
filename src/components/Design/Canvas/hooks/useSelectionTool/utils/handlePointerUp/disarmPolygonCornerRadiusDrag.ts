import { RefObject } from 'react';

// types
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmPolygonCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
): void => disarmSimpleDrag(canvas, event, polygonCornerRadiusDragRef);
