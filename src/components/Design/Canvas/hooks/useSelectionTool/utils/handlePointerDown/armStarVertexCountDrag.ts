import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TStarVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { armVertexCountDrag } from './armVertexCountDrag';

export const armStarVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): void => armVertexCountDrag(canvas, event, starVertexCountDragRef, bounds, nodeId, rotation, flipX, flipY);
