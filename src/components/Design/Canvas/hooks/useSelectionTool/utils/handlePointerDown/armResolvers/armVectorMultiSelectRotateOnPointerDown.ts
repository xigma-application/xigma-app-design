// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiSelectRotateDrag } from '../armVectorMultiSelectRotateDrag';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../../utils/getVectorMultiSelectVertexIds';
import { hitsSelectedSegment } from './armVectorLassoOnPointerDown/hitsSelectedSegment';
import { isInVectorMultiSelectRotateRing } from '../../../../../utils/isInVectorMultiSelectRotateRing';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorMultiSelectRotateOnPointerDown = (context: TArmContext): true | undefined => {
  const { canvas, canvasRefs, event, point, viewport } = context;

  if (!event.shiftKey) {
    const state = store.getState();
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const selectedVertexIds = canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current;
    const selectedHandles = canvasRefs.vectorEdit.selectedVectorHandlesRef.current;
    const selectedSegmentIds = canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current;
    const vertexIds = getVectorMultiSelectVertexIds(state.design.nodes, vectorEditingNodeIds, selectedVertexIds, selectedSegmentIds);

    if (isVectorMultiSelectBoxEligible(vertexIds, selectedHandles) && !hitsSelectedSegment(context, vectorEditingNodeIds)) {
      const box = getVectorMultiSelectBox(
        state.design.nodes,
        vectorEditingNodeIds,
        vertexIds,
        selectedHandles,
        canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef,
      );

      if (box && isInVectorMultiSelectRotateRing(point, box.bounds, viewport, box.rotation)) {
        armVectorMultiSelectRotateDrag(
          canvas,
          event,
          canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef,
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
  }
};
