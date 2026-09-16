// store
import { AppDispatch } from 'store';
import { setImageEditor } from 'store/design/slice';
import { TImageEditorState, TImageEditorTarget } from 'store/design/types';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageCrop } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';

// utils
import { armImageCropMoveDrag } from '../../armImageCropMoveDrag';

export const armImageCropMoveOnPointerDown = (
  canvas: HTMLCanvasElement,
  canvasRefs: TCanvasRefs,
  dispatch: AppDispatch,
  event: PointerEvent,
  nodeId: string,
  imageEditor: TImageEditorState,
  crop: TImageCrop,
  point: TPoint,
  selectedTarget: TImageEditorTarget,
): void => {
  if (selectedTarget !== 'image') {
    dispatch(setImageEditor({ ...imageEditor, selectedTarget: 'image' }));
  }

  armImageCropMoveDrag(canvas, event, canvasRefs.imageCrop.imageCropMoveDragRef, nodeId, imageEditor.paintIndex, crop, point);
};
