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

    if (imageEditor && imageEditor.mode !== 'crop' && selectedNodes.some((node) => node.id === imageEditor.nodeId)) {
      dispatch(setImageEditor({ ...imageEditor, mode: 'crop' }));
    }

    armResizeDrag(canvas, event, selectionRefs.resizeDragRef, selectedNodes, resizeHandleHit.handle, resizeHandleHit.bounds, canvasRefs);

    return true;
  }
};
