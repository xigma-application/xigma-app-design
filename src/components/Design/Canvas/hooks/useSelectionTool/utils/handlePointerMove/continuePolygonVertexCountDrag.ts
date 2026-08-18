import { RefObject } from 'react';

// others
import { POLYGON_MAX_SIDES, POLYGON_MIN_SIDES } from '../../../../constants';

// store
import { AppDispatch } from 'store';

// types
import { TPolygonVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { continueVertexCountDrag } from './continueVertexCountDrag';

export const continuePolygonVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>,
): void => continueVertexCountDrag(canvas, event, dispatch, polygonVertexCountDragRef, POLYGON_MIN_SIDES, POLYGON_MAX_SIDES, 'sides');
