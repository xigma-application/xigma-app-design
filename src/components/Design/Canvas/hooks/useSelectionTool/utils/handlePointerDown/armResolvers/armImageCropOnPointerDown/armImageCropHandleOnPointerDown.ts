// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageCrop } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { armImageCropResizeDrag } from '../../armImageCropResizeDrag';
import { armImageCropRotateDrag } from '../../armImageCropRotateDrag';
import { getImageCropResizeHandleAtPoint } from 'components/Design/Canvas/utils/getImageCropResizeHandleAtPoint';
import { isImageCropRotateHandleAtPoint } from 'components/Design/Canvas/utils/isImageCropRotateHandleAtPoint';

export const armImageCropHandleOnPointerDown = (
  canvas: HTMLCanvasElement,
  canvasRefs: TCanvasRefs,
  event: PointerEvent,
  nodeId: string,
  paintIndex: number,
  crop: TImageCrop,
  point: TPoint,
  viewport: TViewport,
): true | undefined => {
  const resizeHandle = getImageCropResizeHandleAtPoint(point, crop, viewport);

  if (resizeHandle) {
    armImageCropResizeDrag(canvas, event, canvasRefs.imageCrop.imageCropResizeDragRef, nodeId, paintIndex, crop, resizeHandle);
    return true;
  }

  if (isImageCropRotateHandleAtPoint(point, crop, viewport)) {
    armImageCropRotateDrag(canvas, event, canvasRefs.imageCrop.imageCropRotateDragRef, nodeId, paintIndex, crop, point);
    return true;
  }
};
