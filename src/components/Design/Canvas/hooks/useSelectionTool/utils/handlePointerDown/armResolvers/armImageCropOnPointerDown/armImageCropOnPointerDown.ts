// store
import { selectImageEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { armImageCropPaintOnPointerDown } from './armImageCropPaintOnPointerDown';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

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

  if (imageEditor?.mode === 'crop') {
    const node = selectedNodes.find((selectedNode) => selectedNode.id === imageEditor.nodeId);

    if (node && isAppearanceNode(node)) {
      const paint = node.fills[imageEditor.paintIndex];

      if (paint?.type === 'image') {
        return armImageCropPaintOnPointerDown(canvas, canvasRefs, dispatch, event, hit, point, viewport, imageEditor, node, paint);
      }
    }
  }
};
