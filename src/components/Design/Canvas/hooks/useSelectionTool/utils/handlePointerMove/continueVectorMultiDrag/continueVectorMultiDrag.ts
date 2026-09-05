// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { dispatchVectorMultiDragUpdates } from './dispatchVectorMultiDragUpdates';
import { getVectorMultiDragDelta } from './getVectorMultiDragDelta';
import { groupVectorMultiSelectOriginsByNode } from 'components/Design/Canvas/utils/groupVectorMultiSelectOriginsByNode';
import { updateVectorMultiSelectBoxPosition } from './updateVectorMultiSelectBoxPosition';

export const continueVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = canvasRefs.vectorMultiSelect.vectorMultiDragRef.current;

  if (dragState) {
    const state = store.getState();
    const nodes: Record<string, TSceneNode> = state.design.pages[state.design.activePageId].nodes;
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const groups = groupVectorMultiSelectOriginsByNode(nodes, vectorEditingNodeIds, dragState.vertexOrigins, dragState.handleOrigins);

    if (Object.keys(groups).length !== 0) {
      dragState.hasMoved = true;

      const viewport = selectViewport(state);
      const { deltaX, deltaY, guide } = getVectorMultiDragDelta(canvas, event, viewport, nodes, dragState);

      dispatchVectorMultiDragUpdates(dispatch, nodes, groups, dragState, deltaX, deltaY);
      updateVectorMultiSelectBoxPosition(canvasRefs, dragState, deltaX, deltaY);
      canvasRefs.vectorEdit.vectorAlignmentGuideRef.current = guide;
      setClassName('move');
    }
  }
};
