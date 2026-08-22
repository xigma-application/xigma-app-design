// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiDrag } from '../armVectorMultiDrag';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectOwningNode } from '../../../../../utils/getVectorMultiSelectOwningNode';
import { getVectorMultiSelectVertexIds } from '../../../../../utils/getVectorMultiSelectVertexIds';
import { isPointInRect } from '../../../../../utils/isPointInRect';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';
import { rotatePoint } from 'utils/math/rotatePoint';

export const armVectorMultiSelectBoxOnPointerDown = ({ canvas, canvasRefs, event, point }: TArmContext): true | undefined => {
  if (!event.shiftKey) {
    const state = store.getState();
    const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
    const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;
    const selectedSegmentIds = canvasRefs.selectedVectorSegmentIdsRef.current;
    const node = getVectorMultiSelectOwningNode(
      selectVectorEditingNodeIds(state),
      state.design.nodes,
      selectedVertexIds,
      selectedHandles,
      selectedSegmentIds,
    );

    if (node) {
      const vertexIds = getVectorMultiSelectVertexIds(node, selectedVertexIds, selectedSegmentIds);

      if (isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)) {
        const box = getVectorMultiSelectBox(node, vertexIds, selectedHandles, canvasRefs.vectorMultiSelectBoxRef);
        const pivot = box && { x: box.bounds.x + box.bounds.width / 2, y: box.bounds.y + box.bounds.height / 2 };
        const localPoint = box && pivot && rotatePoint(point, pivot, -box.rotation);

        if (box && localPoint && isPointInRect(localPoint, box.bounds)) {
          armVectorMultiDrag(canvas, event, canvasRefs.vectorMultiDragRef, node, vertexIds, selectedHandles, point, null, box);
          return true;
        }
      }
    }
  }
};
