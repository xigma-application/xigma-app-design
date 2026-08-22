// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiSelectResizeDrag } from '../armVectorMultiSelectResizeDrag';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectOwningNode } from '../../../../../utils/getVectorMultiSelectOwningNode';
import { getVectorMultiSelectResizeHandle } from '../../../../../utils/getVectorMultiSelectResizeHandle';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorMultiSelectResizeOnPointerDown = ({ canvas, canvasRefs, event, point, viewport }: TArmContext): true | undefined => {
  const state = store.getState();
  const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
  const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;
  const node = getVectorMultiSelectOwningNode(selectVectorEditingNodeIds(state), state.design.nodes, selectedVertexIds, selectedHandles);

  if (node) {
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
