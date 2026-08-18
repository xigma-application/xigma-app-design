import { RefObject } from 'react';

// types
import { TPolygonVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmPolygonVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>,
): void => disarmSimpleDrag(canvas, event, polygonVertexCountDragRef);
