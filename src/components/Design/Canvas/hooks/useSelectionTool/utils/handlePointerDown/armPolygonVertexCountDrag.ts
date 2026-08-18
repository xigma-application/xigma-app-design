import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TPolygonVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { armVertexCountDrag } from './armVertexCountDrag';

export const armPolygonVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
): void => armVertexCountDrag(canvas, event, polygonVertexCountDragRef, bounds, nodeId, rotation, flipX, flipY);
