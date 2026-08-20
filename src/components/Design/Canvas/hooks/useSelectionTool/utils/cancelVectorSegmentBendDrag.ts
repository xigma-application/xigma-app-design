import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';

export const cancelVectorSegmentBendDrag = (
  event: KeyboardEvent,
  dispatch: AppDispatch,
  vectorSegmentBendDragRef: RefObject<TVectorSegmentBendDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = vectorSegmentBendDragRef.current;

  if (event.key === 'Escape' && dragState) {
    if (dragState.status === 'committed') {
      const node = getVectorEditingNode(store.getState().design.nodes, dragState.nodeId);

      if (node) {
        const segment = node.segments[dragState.segmentId];
        const segments = {
          ...node.segments,
          [dragState.segmentId]: { ...segment, tangentEnd: dragState.originalTangentEnd, tangentStart: dragState.originalTangentStart },
        };

        dispatch(updateNode({ changes: { segments }, id: dragState.nodeId }));
      }
    }

    vectorSegmentBendDragRef.current = null;
    setClassName(null);
  }
};
