// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { commitVectorDivide } from './commitVectorDivide';
import { commitVectorSplit } from './commitVectorSplit';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const disarmVectorCutDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
): void => {
  const dragState = selectionRefs.vectorCutDragRef.current;

  if (dragState) {
    if (dragState.status === 'pending' && dragState.hit) {
      const node = getVectorEditingNode(store.getState().design.nodes, dragState.hit.nodeId);

      if (node) {
        commitVectorSplit(dispatch, node, dragState.hit.segmentId, dragState.hit.t);
      }
    } else if (dragState.status === 'dividing') {
      const lineEnd = canvasRefs.vectorCutPreviewRef.current?.lineEnd ?? dragState.lineStart;

      commitVectorDivide(dispatch, dragState.lineStart, lineEnd, selectVectorEditingNodeIds(store.getState()), canvasRefs);
    }

    canvas.releasePointerCapture(event.pointerId);
    selectionRefs.vectorCutDragRef.current = null;
    canvasRefs.vectorCutPreviewRef.current = null;
  }
};
