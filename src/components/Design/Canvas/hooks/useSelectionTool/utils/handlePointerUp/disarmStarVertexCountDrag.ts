import { RefObject } from 'react';

// types
import { TStarVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmStarVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>,
): void => disarmSimpleDrag(canvas, event, starVertexCountDragRef);
