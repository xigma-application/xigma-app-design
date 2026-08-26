// store
import { deleteNode, updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../utils/bakeVectorNodeRotation';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { mergeVectorVertices } from 'utils/canvas/vectorNetwork/mergeVectorVertices/mergeVectorVertices';

export const disarmVectorVertexDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = selectionRefs.vectorVertexDragRef.current;

  if (dragState) {
    flushThrottledDispatch(dragState.dispatchThrottle);

    if (dragState.mergeTarget) {
      const state = store.getState();
      const sourceNode = getVectorEditingNode(state.design.nodes, dragState.nodeId);
      const isSameNode = dragState.mergeTarget.nodeId === sourceNode?.id;
      const rawTargetNode = state.design.nodes[dragState.mergeTarget.nodeId] as TVectorNode | undefined;
      const targetNode = isSameNode
        ? sourceNode
        : rawTargetNode && {
            ...bakeVectorNodeRotation(rawTargetNode),
            filledFaceKeys: rawTargetNode.filledFaceKeys,
            vertexHandleModes: rawTargetNode.vertexHandleModes,
          };

      if (sourceNode && targetNode) {
        const [sourceVertexId] = Object.keys(dragState.origins);
        const merged = mergeVectorVertices(sourceNode, targetNode, sourceVertexId, dragState.mergeTarget.vertexId);

        dispatch(updateNode({ changes: merged, id: sourceNode.id }));

        if (!isSameNode) {
          dispatch(deleteNode(dragState.mergeTarget.nodeId));
        }

        canvasRefs.selectedVectorVertexIdsRef.current = [sourceVertexId];
        canvasRefs.selectedVectorHandlesRef.current = [];
        canvasRefs.selectedVectorSegmentIdsRef.current = [];
      }
    }

    canvas.releasePointerCapture(event.pointerId);
    selectionRefs.vectorVertexDragRef.current = null;
    canvasRefs.vectorAlignmentGuideRef.current = null;
    canvasRefs.draggedVectorFillFacesRef.current = null;
    setClassName(null);
  }
};
