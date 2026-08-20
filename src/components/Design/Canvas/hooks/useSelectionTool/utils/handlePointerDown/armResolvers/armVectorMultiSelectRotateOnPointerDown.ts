// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiSelectRotateDrag } from '../armVectorMultiSelectRotateDrag';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { isInVectorMultiSelectRotateRing } from '../../../../../utils/isInVectorMultiSelectRotateRing';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorMultiSelectRotateOnPointerDown = ({ canvas, canvasRefs, event, point, viewport }: TArmContext): true | undefined => {
  const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

  if (node) {
    const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
    const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;

    if (isVectorMultiSelectBoxEligible(selectedVertexIds, selectedHandles)) {
      const box = getVectorMultiSelectBox(node, selectedVertexIds, selectedHandles, canvasRefs.vectorMultiSelectBoxRef);

      if (box && isInVectorMultiSelectRotateRing(point, box.bounds, viewport, box.rotation)) {
        armVectorMultiSelectRotateDrag(
          canvas,
          event,
          canvasRefs.vectorMultiSelectRotateDragRef,
          node,
          selectedVertexIds,
          selectedHandles,
          box.bounds,
          box.rotation,
          point,
        );

        return true;
      }
    }
  }
};
