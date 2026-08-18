import { RefObject } from 'react';

// types
import { TDraftRect } from 'types/canvas';
import { TStarRatioDragState } from 'types/design/selectionTool/types';

// utils
import { armSimpleDrag } from './armSimpleDrag';

export const armStarRatioDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starRatioDragRef: RefObject<TStarRatioDragState | null>,
  bounds: TDraftRect,
  nodeId: string,
  rotation: number,
  points: number,
  flipX: boolean,
  flipY: boolean,
): void => armSimpleDrag(canvas, event, starRatioDragRef, { bounds, flipX, flipY, nodeId, points, rotation });
