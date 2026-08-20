// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiSelectResizeDrag } from '../armVectorMultiSelectResizeDrag';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectResizeHandle } from '../../../../../utils/getVectorMultiSelectResizeHandle';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorMultiSelectResizeOnPointerDown = ({ canvas, canvasRefs, event, point, viewport }: TArmContext): true | undefined => {
  const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

  if (node) {
    const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
    const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;

    if (isVectorMultiSelectBoxEligible(selectedVertexIds, selectedHandles)) {
      const box = getVectorMultiSelectBox(node, selectedVertexIds, selectedHandles, canvasRefs.vectorMultiSelectBoxRef);
      const handle = box && getVectorMultiSelectResizeHandle(point, box.bounds, viewport, box.rotation);

      if (box && handle) {
        armVectorMultiSelectResizeDrag(
          canvas,
          event,
          canvasRefs.vectorMultiSelectResizeDragRef,
          node,
          selectedVertexIds,
          selectedHandles,
          box.bounds,
          box.rotation,
          handle,
        );

        return true;
      }
    }
  }
};
