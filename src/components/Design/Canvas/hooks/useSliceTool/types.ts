// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

export type TSliceDraft = TDraftRect & { rotation: number };

export type TSliceDrawDragState = { start: TPoint };

export type TSliceResizeDragState = { bounds: TSliceDraft; handle: TResizeHandle };

export type TSliceRotateDragState = { cursorAngle: number; origin: TSliceDraft; pivot: TPoint; startAngle: number };

export type TSliceMoveDragState = { origin: TSliceDraft; pointerStart: TPoint };
