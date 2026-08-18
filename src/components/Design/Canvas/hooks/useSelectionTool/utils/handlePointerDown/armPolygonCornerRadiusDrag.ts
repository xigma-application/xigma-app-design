import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { armSimpleDrag } from './armSimpleDrag';

export const armPolygonCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  sides: number,
  flipX: boolean,
  flipY: boolean,
): void => armSimpleDrag(canvas, event, polygonCornerRadiusDragRef, { bounds, flipX, flipY, hasMoved: false, nodeId, rotation, sides });
