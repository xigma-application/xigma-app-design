// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiSelectResizeDrag } from '../armVectorMultiSelectResizeDrag';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectResizeHandle } from '../../../../../utils/getVectorMultiSelectResizeHandle';
import { getVectorMultiSelectVertexIds } from '../../../../../utils/getVectorMultiSelectVertexIds';
import { hitsSelectedSegment } from './armVectorLassoOnPointerDown/hitsSelectedSegment';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorMultiSelectResizeOnPointerDown = (context: TArmContext): true | undefined => {
  const { canvas, canvasRefs, event, point, viewport } = context;

  if (!event.shiftKey) {
    const state = store.getState();
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const selectedVertexIds = canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current;
    const selectedHandles = canvasRefs.vectorEdit.selectedVectorHandlesRef.current;
    const selectedSegmentIds = canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current;
    const vertexIds = getVectorMultiSelectVertexIds(
      state.design.pages[state.design.activePageId].nodes,
      vectorEditingNodeIds,
      selectedVertexIds,
      selectedSegmentIds,
    );

    if (isVectorMultiSelectBoxEligible(vertexIds, selectedHandles) && !hitsSelectedSegment(context, vectorEditingNodeIds)) {
      const box = getVectorMultiSelectBox(
        state.design.pages[state.design.activePageId].nodes,
        vectorEditingNodeIds,
        vertexIds,
        selectedHandles,
        canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef,
      );
      const isResizable = box && box.bounds.width > 0 && box.bounds.height > 0;
      const handle = isResizable && getVectorMultiSelectResizeHandle(point, box.bounds, viewport, box.rotation);

      if (box && handle) {
        armVectorMultiSelectResizeDrag(
          canvas,
          event,
          canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef,
          state.design.pages[state.design.activePageId].nodes,
          vectorEditingNodeIds,
          vertexIds,
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
