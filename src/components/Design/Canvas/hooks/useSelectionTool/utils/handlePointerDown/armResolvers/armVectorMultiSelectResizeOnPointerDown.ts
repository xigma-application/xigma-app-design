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
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorMultiSelectResizeOnPointerDown = ({ canvas, canvasRefs, event, point, viewport }: TArmContext): true | undefined => {
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
    const handle = box && getVectorMultiSelectResizeHandle(point, box.bounds, viewport, box.rotation);

    if (box && handle) {
      armVectorMultiSelectResizeDrag(
        canvas,
        event,
        canvasRefs.vectorMultiSelectResizeDragRef,
        state.design.nodes,
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
};
