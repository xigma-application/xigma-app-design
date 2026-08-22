// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiSelectRotateDrag } from '../armVectorMultiSelectRotateDrag';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectOwningNode } from '../../../../../utils/getVectorMultiSelectOwningNode';
import { isInVectorMultiSelectRotateRing } from '../../../../../utils/isInVectorMultiSelectRotateRing';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorMultiSelectRotateOnPointerDown = ({ canvas, canvasRefs, event, point, viewport }: TArmContext): true | undefined => {
  const state = store.getState();
  const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
  const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;
  const node = getVectorMultiSelectOwningNode(selectVectorEditingNodeIds(state), state.design.nodes, selectedVertexIds, selectedHandles);

  if (node) {
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
