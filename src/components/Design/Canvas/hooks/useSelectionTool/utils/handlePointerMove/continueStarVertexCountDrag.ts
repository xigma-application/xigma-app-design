import { RefObject } from 'react';

// others
import { STAR_MAX_POINTS, STAR_MIN_POINTS } from '../../../../constants';

// store
import { AppDispatch } from 'store';

// types
import { TStarVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { continueVertexCountDrag } from './continueVertexCountDrag';

export const continueStarVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>,
): void => continueVertexCountDrag(canvas, event, dispatch, starVertexCountDragRef, STAR_MIN_POINTS, STAR_MAX_POINTS, 'points');
