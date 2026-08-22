// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiSelectRotateDrag } from '../armVectorMultiSelectRotateDrag';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../../utils/getVectorMultiSelectVertexIds';
import { isInVectorMultiSelectRotateRing } from '../../../../../utils/isInVectorMultiSelectRotateRing';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorMultiSelectRotateOnPointerDown = ({ canvas, canvasRefs, event, point, viewport }: TArmContext): true | undefined => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
  const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;
  const selectedSegmentIds = canvasRefs.selectedVectorSegmentIdsRef.current;
  const vertexIds = getVectorMultiSelectVertexIds(state.design.nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);

  if (isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)) {
    const box = getVectorMultiSelectBox(
      state.design.nodes,
      vectorEditingNodeIds,
      vertexIds,
      selectedHandles,
      canvasRefs.vectorMultiSelectBoxRef,
    );

    if (box && isInVectorMultiSelectRotateRing(point, box.bounds, viewport, box.rotation)) {
      armVectorMultiSelectRotateDrag(
        canvas,
        event,
        canvasRefs.vectorMultiSelectRotateDragRef,
        state.design.nodes,
        vectorEditingNodeIds,
        vertexIds,
        selectedHandles,
        box.bounds,
        box.rotation,
        point,
      );

      return true;
    }
  }
};
