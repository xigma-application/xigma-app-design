// store
import { AppDispatch } from 'store';
import { setImageEditor } from 'store/design/slice';
import { TImageEditorState } from 'store/design/types';

// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImagePaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { armImageCropHandleOnPointerDown } from './armImageCropHandleOnPointerDown';
import { armImageCropMoveOnPointerDown } from './armImageCropMoveOnPointerDown';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
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
  node: TAppearanceNode,
  paint: TImagePaint,
): true | undefined => {
  const crop = getImageCropRect(node, paint);
  const selectedTarget = imageEditor.selectedTarget ?? 'frame';

  if (selectedTarget === 'image') {
    const handled = armImageCropHandleOnPointerDown(canvas, canvasRefs, event, node.id, imageEditor.paintIndex, crop, point, viewport);

    if (handled) {
      return true;
    }
  }

  if (isPointInImageCropRect(point, crop)) {
    armImageCropMoveOnPointerDown(canvas, canvasRefs, dispatch, event, node.id, imageEditor, crop, point, selectedTarget);
    return true;
  }

  if (selectedTarget === 'image' && hit) {
    dispatch(setImageEditor({ ...imageEditor, selectedTarget: 'frame' }));
  }
};
