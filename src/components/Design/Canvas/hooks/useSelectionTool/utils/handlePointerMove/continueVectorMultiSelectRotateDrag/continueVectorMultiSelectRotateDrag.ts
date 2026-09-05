import { RefObject } from 'react';

// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSceneNode } from 'types/design/types';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

// utils
import { dispatchVectorMultiSelectRotateUpdates } from './dispatchVectorMultiSelectRotateUpdates';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getVectorMultiSelectRotateDelta } from './getVectorMultiSelectRotateDelta';
import { groupVectorMultiSelectOriginsByNode } from 'components/Design/Canvas/utils/groupVectorMultiSelectOriginsByNode';

export const continueVectorMultiSelectRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorMultiSelectRotateDragRef: RefObject<TVectorMultiSelectRotateDragState | null>,
): void => {
  const dragState = vectorMultiSelectRotateDragRef.current;

  if (dragState) {
    const state = store.getState();
    const nodes: Record<string, TSceneNode> = state.design.pages[state.design.activePageId].nodes;
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const viewport = selectViewport(state);
    const deltaDegrees = getVectorMultiSelectRotateDelta(canvas, event, viewport, dragState);

    dragState.deltaDegrees = deltaDegrees;
    canvas.style.cursor = getRotatedCursorUrl('rotate', dragState.cursorAngle + deltaDegrees) ?? canvas.style.cursor;

    const groups = groupVectorMultiSelectOriginsByNode(nodes, vectorEditingNodeIds, dragState.vertexOrigins, dragState.handleOrigins);

    dispatchVectorMultiSelectRotateUpdates(dispatch, nodes, groups, dragState, deltaDegrees);
  }
};
