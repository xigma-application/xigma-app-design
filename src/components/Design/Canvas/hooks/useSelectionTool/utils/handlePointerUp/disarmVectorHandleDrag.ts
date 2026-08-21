// store
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { commitVectorCornerHandleDrag } from '../../../../utils/commitVectorCornerHandleDrag';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';

export const disarmVectorHandleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  const pendingState = selectionRefs.pendingVectorCornerHandleDragRef.current;

  if (pendingState) {
    const node = getVectorEditingNode(store.getState().design.nodes, pendingState.nodeId);

    if (node) {
      commitVectorCornerHandleDrag(
        node,
        pendingState.vertexId,
        pendingState.candidates[0],
        dispatch,
        canvasRefs,
        selectionRefs.vectorHandleDragRef,
      );
    }

    selectionRefs.pendingVectorCornerHandleDragRef.current = null;
  }

  if (selectionRefs.vectorHandleDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    selectionRefs.vectorHandleDragRef.current = null;
    canvasRefs.snappedVectorHandleRef.current = null;
    canvasRefs.vectorAlignmentGuideRef.current = null;
    setClassName(null);
  }
};
