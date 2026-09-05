// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getVectorMultiSelectBox } from '../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectResizeHandle } from '../../../../utils/getVectorMultiSelectResizeHandle';
import { getVectorMultiSelectVertexIds } from '../../../../utils/getVectorMultiSelectVertexIds';
import { isInVectorMultiSelectRotateRing } from '../../../../utils/isInVectorMultiSelectRotateRing';
import { isPointInRect } from '../../../../utils/isPointInRect';
import { isVectorMultiSelectBoxEligible } from '../../../../utils/isVectorMultiSelectBoxEligible';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const resolveVectorMultiSelectBoxHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
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

    /* v8 ignore if -- eligibility already guarantees 2+ resolvable vertex/handle points, so bounds is never null here */
    if (box) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const resizeHandle = getVectorMultiSelectResizeHandle(point, box.bounds, viewport, box.rotation);
      const pivot = { x: box.bounds.x + box.bounds.width / 2, y: box.bounds.y + box.bounds.height / 2 };
      const localPoint = rotatePoint(point, pivot, -box.rotation);

      switch (true) {
        case resizeHandle !== null:
          canvas.style.cursor = getRotatedCursorUrl('resize', getResizeCursorAngle(resizeHandle, box.rotation)) ?? '';
          setClassName(null);
          break;
        case isInVectorMultiSelectRotateRing(point, box.bounds, viewport, box.rotation):
          canvas.style.cursor = getRotatedCursorUrl('rotate', getRotateCursorAngle(point, box.bounds, box.rotation)) ?? '';
          setClassName(null);
          break;
        case isPointInRect(localPoint, box.bounds):
          canvas.style.cursor = '';
          setClassName('move');
          break;
        default:
          canvas.style.cursor = '';
          setClassName(null);
      }
    }
  }
};
