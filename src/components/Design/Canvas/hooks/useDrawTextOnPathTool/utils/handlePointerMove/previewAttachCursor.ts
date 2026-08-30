// types
import { TViewport } from 'types/design/types';

// utils
import { getEligibleVectorAtPoint } from '../getEligibleVectorAtPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const previewAttachCursor = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: TViewport,
  setClassName: (className: string | null) => void,
): void => {
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);

  setClassName(getEligibleVectorAtPoint(point, viewport) ? 'text-on-path' : 'drawing');
};
