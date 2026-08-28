// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiDrag } from '../armVectorMultiDrag';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../../utils/getVectorMultiSelectVertexIds';
import { isPointInRect } from '../../../../../utils/isPointInRect';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';
import { rotatePoint } from 'utils/math/rotatePoint';

export const armVectorMultiSelectBoxOnPointerDown = ({ canvas, canvasRefs, event, point }: TArmContext): true | undefined => {
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

    if (isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)) {
      const box = getVectorMultiSelectBox(
        state.design.pages[state.design.activePageId].nodes,
        vectorEditingNodeIds,
        vertexIds,
        selectedHandles,
        canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef,
      );
      const pivot = box && { x: box.bounds.x + box.bounds.width / 2, y: box.bounds.y + box.bounds.height / 2 };
      const localPoint = box && pivot && rotatePoint(point, pivot, -box.rotation);

      if (box && localPoint && isPointInRect(localPoint, box.bounds)) {
        armVectorMultiDrag(
          canvas,
          event,
          canvasRefs,
          state.design.pages[state.design.activePageId].nodes,
          vectorEditingNodeIds,
          vertexIds,
          selectedHandles,
          point,
          null,
          box,
        );

        return true;
      }
    }
  }
};
