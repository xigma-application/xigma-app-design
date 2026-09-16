// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armResizeDrag } from '../armResizeDrag/armResizeDrag';
import { getResizeHandleAtPoint } from '../../../../../utils/getResizeHandleAtPoint/getResizeHandleAtPoint';

export const armResizeOnPointerDown = ({
  canvas,
  canvasRefs,
  dispatch,
  event,
  point,
  selectedNodes,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const resizeHandleHit = getResizeHandleAtPoint(point, selectedNodes, viewport);

  if (resizeHandleHit) {
    const imageEditor = selectImageEditor(store.getState());
    const targetsSelectedNode = Boolean(imageEditor) && selectedNodes.some((node) => node.id === imageEditor?.nodeId);

    if (imageEditor?.mode !== 'crop' || imageEditor.selectedTarget !== 'image' || !targetsSelectedNode) {
      if (imageEditor && imageEditor.mode !== 'crop' && targetsSelectedNode) {
        dispatch(setImageEditor({ ...imageEditor, mode: 'crop' }));
      }

      armResizeDrag(canvas, event, selectionRefs.resizeDragRef, selectedNodes, resizeHandleHit.handle, resizeHandleHit.bounds, canvasRefs);

      return true;
    }
  }
};
