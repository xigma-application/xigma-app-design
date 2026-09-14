// types
import { TCanvasRefs, TGradientRotateDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawGradientRotateAngleLabel } from './drawGradientRotateAngleLabel';

export const drawActiveGradientRotateAngleLabel = (
  context: TDrawSceneContext,
  start: TPoint,
  end: TPoint,
  isRotatingThisPaint: boolean,
  rotateDragState: TGradientRotateDragState | null,
  refs: TCanvasRefs,
): void => {
  const pointerPosition =
    isRotatingThisPaint && rotateDragState
      ? rotateDragState.pointerPosition
      : (refs.hover.hoveredGradientRotateEndpointRef.current?.pointerPosition ?? null);

  if (pointerPosition) {
    drawGradientRotateAngleLabel(context, pointerPosition, start, end);
  }
};
