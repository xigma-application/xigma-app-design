// store
import { AppDispatch } from 'store';
import { setImageEditor } from 'store/design/slice';
import { TImageEditorState } from 'store/design/types';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { armImageCropHandleOnPointerDown } from './armImageCropHandleOnPointerDown';
import { armImageCropMoveOnPointerDown } from './armImageCropMoveOnPointerDown';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { getResizeHandleAtPoint } from 'components/Design/Canvas/utils/getResizeHandleAtPoint/getResizeHandleAtPoint';
import { getRotateHandleAtPoint } from 'components/Design/Canvas/utils/getRotateHandleAtPoint';
import { isPointInImageCropRect } from 'components/Design/Canvas/utils/isPointInImageCropRect';

export const armImageCropPaintOnPointerDown = (
  canvas: HTMLCanvasElement,
  canvasRefs: TCanvasRefs,
  dispatch: AppDispatch,
  event: PointerEvent,
  hit: TSceneNode | null,
  point: TPoint,
  viewport: TViewport,
  imageEditor: TImageEditorState,
  node: TImageFrameNode,
  paint: TImagePaint | TVideoPaint,
): true | undefined => {
  const crop = getImageCropRect(node, paint);
  const selectedTarget = imageEditor.selectedTarget ?? 'frame';
  const isHandleArmed =
    selectedTarget === 'image' &&
    armImageCropHandleOnPointerDown(
      canvas,
      canvasRefs,
      event,
      node.id,
      imageEditor.paintIndex,
      crop,
      point,
      viewport,
      paint.flipX,
      paint.flipY,
    );

  switch (true) {
    case isHandleArmed:
      return true;
    case isPointInImageCropRect(point, crop):
      armImageCropMoveOnPointerDown(canvas, canvasRefs, dispatch, event, node.id, imageEditor, crop, point, selectedTarget);
      return true;
    case hit?.id === node.id && selectedTarget === 'image':
      dispatch(setImageEditor({ ...imageEditor, selectedTarget: 'frame' }));
      return;
    case hit?.id === node.id:
    case Boolean(getResizeHandleAtPoint(point, [node], viewport) || getRotateHandleAtPoint(point, [node], viewport)):
      return;
    default:
      dispatch(setImageEditor(null));
      return true;
  }
};
