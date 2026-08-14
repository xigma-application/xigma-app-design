// store
import { selectEditingNodeId, selectEditingTextBox, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateEditingTextBoxPathStartOffset, updateNode } from 'store/design/slice';

// utils
import { getNearestPathOffsetAtPoint } from 'utils/canvas/shapes/getNearestPathOffsetAtPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueEditingPathOffsetDrag = (canvas: HTMLCanvasElement, event: PointerEvent, dispatch: AppDispatch): void => {
  const state = store.getState();
  const box = selectEditingTextBox(state);

  if (box) {
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const offset = getNearestPathOffsetAtPoint(point, box);
    const editingNodeId = selectEditingNodeId(state);

    dispatch(updateEditingTextBoxPathStartOffset(offset));

    if (editingNodeId) {
      dispatch(updateNode({ changes: { pathStartOffset: offset }, id: editingNodeId }));
    }
  }
};
