// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiDrag } from '../armVectorMultiDrag';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorMultiSelectBounds } from 'utils/canvas/vectorNetwork/getVectorMultiSelectBounds';
import { isPointInRect } from '../../../../../utils/isPointInRect';

export const armVectorMultiSelectBoxOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (!event.shiftKey) {
    const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

    if (node) {
      const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
      const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;

      if (selectedVertexIds.length + selectedHandles.length > 1) {
        const bounds = getVectorMultiSelectBounds(node, selectedVertexIds, selectedHandles);

        if (bounds && isPointInRect(point, bounds)) {
          armVectorMultiDrag(canvas, event, selectionRefs.vectorMultiDragRef, node, selectedVertexIds, selectedHandles, point);

          return true;
        }
      }
    }
  }
};
