// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorMultiDrag } from '../armVectorMultiDrag';
import { getVectorMultiSelectBox } from '../../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectOwningNode } from '../../../../../utils/getVectorMultiSelectOwningNode';
import { isPointInRect } from '../../../../../utils/isPointInRect';
import { isVectorMultiSelectBoxEligible } from '../../../../../utils/isVectorMultiSelectBoxEligible';
import { rotatePoint } from 'utils/math/rotatePoint';

export const armVectorMultiSelectBoxOnPointerDown = ({ canvas, canvasRefs, event, point }: TArmContext): true | undefined => {
  if (!event.shiftKey) {
    const state = store.getState();
    const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
    const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;
    const node = getVectorMultiSelectOwningNode(selectVectorEditingNodeIds(state), state.design.nodes, selectedVertexIds, selectedHandles);

    if (node) {
      if (isVectorMultiSelectBoxEligible(selectedVertexIds, selectedHandles)) {
        const box = getVectorMultiSelectBox(node, selectedVertexIds, selectedHandles, canvasRefs.vectorMultiSelectBoxRef);
        const pivot = box && { x: box.bounds.x + box.bounds.width / 2, y: box.bounds.y + box.bounds.height / 2 };
        const localPoint = box && pivot && rotatePoint(point, pivot, -box.rotation);

        if (box && localPoint && isPointInRect(localPoint, box.bounds)) {
          armVectorMultiDrag(canvas, event, canvasRefs.vectorMultiDragRef, node, selectedVertexIds, selectedHandles, point, null, box);

          return true;
        }
      }
    }
  }
};
