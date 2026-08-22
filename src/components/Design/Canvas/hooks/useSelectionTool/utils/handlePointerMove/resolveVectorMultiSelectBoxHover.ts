// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';
import { getVectorMultiSelectBox } from '../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectOwningNode } from '../../../../utils/getVectorMultiSelectOwningNode';
import { getVectorMultiSelectResizeHandle } from '../../../../utils/getVectorMultiSelectResizeHandle';
import { getVectorMultiSelectVertexIds } from '../../../../utils/getVectorMultiSelectVertexIds';
import { isInVectorMultiSelectRotateRing } from '../../../../utils/isInVectorMultiSelectRotateRing';
import { isPointInRect } from '../../../../utils/isPointInRect';
import { isVectorMultiSelectBoxEligible } from '../../../../utils/isVectorMultiSelectBoxEligible';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorMultiSelectBoxHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
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
  const vertexIds = node ? getVectorMultiSelectVertexIds(node, selectedVertexIds, selectedSegmentIds) : selectedVertexIds;

  if (node && isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)) {
    const box = getVectorMultiSelectBox(node, vertexIds, selectedHandles, canvasRefs.vectorMultiSelectBoxRef);

    /* v8 ignore if -- eligibility already guarantees 2+ resolvable vertex/handle points, so bounds is never null here */
    if (box) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const resizeHandle = getVectorMultiSelectResizeHandle(point, box.bounds, viewport, box.rotation);
      const pivot = { x: box.bounds.x + box.bounds.width / 2, y: box.bounds.y + box.bounds.height / 2 };
      const localPoint = rotatePoint(point, pivot, -box.rotation);

      if (resizeHandle) {
        canvas.style.cursor = getRotatedResizeCursorUrl(getResizeCursorAngle(resizeHandle, box.rotation)) ?? '';
        setClassName(null);
      } else if (isInVectorMultiSelectRotateRing(point, box.bounds, viewport, box.rotation)) {
        canvas.style.cursor = getRotatedRotateCursorUrl(getRotateCursorAngle(point, box.bounds, box.rotation)) ?? '';
        setClassName(null);
      } else if (isPointInRect(localPoint, box.bounds)) {
        canvas.style.cursor = '';
        setClassName('move');
      } else {
        canvas.style.cursor = '';
        setClassName(null);
      }
    }
  }
};
