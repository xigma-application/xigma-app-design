import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TStarCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { armSimpleDrag } from './armSimpleDrag';

export const armStarCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  points: number,
  ratio: number,
  flipX: boolean,
  flipY: boolean,
): void =>
  armSimpleDrag(canvas, event, starCornerRadiusDragRef, { bounds, flipX, flipY, hasMoved: false, nodeId, points, ratio, rotation });
