// types
import { TPoint, TResizeHandle } from 'types/canvas';
import { TSliceDraft } from 'types/design/canvas/types';

export type TSliceDrawDragState = { start: TPoint };

export type TSliceResizeDragState = { bounds: TSliceDraft; handle: TResizeHandle };

export type TSliceRotateDragState = { cursorAngle: number; origin: TSliceDraft; pivot: TPoint; startAngle: number };

export type TSliceMoveDragState = { origin: TSliceDraft; pointerStart: TPoint };
