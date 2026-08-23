// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { setActiveTool } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { commitVectorDivide } from './commitVectorDivide/commitVectorDivide';
import { commitVectorSplit } from './commitVectorSplit';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { markNewVectorCutVertices } from './markNewVectorCutVertices';

export const disarmVectorCutDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = selectionRefs.vectorCutDragRef.current;

  if (dragState) {
    const beforeNodes = store.getState().design.nodes;
    const vectorEditingNodeIds = selectVectorEditingNodeIds(store.getState());

    if (dragState.status === 'pending' && dragState.hit) {
      const node = getVectorEditingNode(beforeNodes, dragState.hit.nodeId);

      if (node) {
        commitVectorSplit(dispatch, node, dragState.hit.segmentId, dragState.hit.t);
        dispatch(setActiveTool(ToolName.move));
      }
    } else if (dragState.status === 'dividing') {
      const lineEnd = canvasRefs.vectorCutPreviewRef.current?.lineEnd ?? dragState.lineStart;

      if (commitVectorDivide(dispatch, dragState.lineStart, lineEnd, vectorEditingNodeIds, canvasRefs)) {
        dispatch(setActiveTool(ToolName.move));
      }
    }

    markNewVectorCutVertices(canvasRefs, beforeNodes, vectorEditingNodeIds);
    canvas.releasePointerCapture(event.pointerId);
    selectionRefs.vectorCutDragRef.current = null;
    canvasRefs.vectorCutPreviewRef.current = null;
    setClassName('cut-off');
  }
};
