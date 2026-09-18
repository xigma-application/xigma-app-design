// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { armImageCropPaintOnPointerDown } from './armImageCropPaintOnPointerDown';
import { armImageTileScaleOnPointerDown } from './armImageTileScaleOnPointerDown';
import { getResizeHandleAtPoint } from 'components/Design/Canvas/utils/getResizeHandleAtPoint/getResizeHandleAtPoint';
import { getRotateHandleAtPoint } from 'components/Design/Canvas/utils/getRotateHandleAtPoint';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

const isOwnHandleAtPoint = (point: TArmContext['point'], node: TSceneNode, viewport: TArmContext['viewport']): boolean =>
  Boolean(getResizeHandleAtPoint(point, [node], viewport) || getRotateHandleAtPoint(point, [node], viewport));

export const armImageCropOnPointerDown = ({
  canvas,
  canvasRefs,
  dispatch,
  event,
  hit,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const imageEditor = selectImageEditor(store.getState());
  const editorNode = imageEditor ? selectedNodes.find((selectedNode) => selectedNode.id === imageEditor.nodeId) : undefined;

  if (
    imageEditor &&
    imageEditor.mode !== 'crop' &&
    imageEditor.mode !== 'tile' &&
    hit?.id !== imageEditor.nodeId &&
    !(editorNode && isOwnHandleAtPoint(point, editorNode, viewport))
  ) {
    dispatch(setImageEditor(null));
    return true;
  }

  if (imageEditor?.mode === 'crop' && editorNode && isAppearanceNode(editorNode)) {
    const paint = editorNode.fills[imageEditor.paintIndex];

    if (paint?.type === 'image' || paint?.type === 'video') {
      return armImageCropPaintOnPointerDown(canvas, canvasRefs, dispatch, event, hit, point, viewport, imageEditor, editorNode, paint);
    }
  }

  if (imageEditor?.mode === 'tile' && editorNode && isAppearanceNode(editorNode)) {
    const paint = editorNode.fills[imageEditor.paintIndex];

    if (paint?.type === 'image' || paint?.type === 'video') {
      return armImageTileScaleOnPointerDown(canvas, canvasRefs, dispatch, event, hit, point, viewport, imageEditor, editorNode, paint);
    }
  }
};
