// types
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';
import { TViewport } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const getVectorMultiSelectRotateDelta = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: TViewport,
  dragState: TVectorMultiSelectRotateDragState,
): number => {
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);

  return getAngleBetweenPoints(dragState.pivot, point) - dragState.startAngle;
};
