import { RefObject } from 'react';

// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { dispatchVectorMultiSelectResizeUpdates } from './dispatchVectorMultiSelectResizeUpdates';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import {
  getScaledVectorMultiSelectBounds,
  getVectorMultiSelectResizeScale,
  repositionRotatedVectorMultiSelectBounds,
} from 'components/Design/Canvas/utils/getVectorMultiSelectResizeTransform';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { groupVectorMultiSelectOriginsByNode } from 'components/Design/Canvas/utils/groupVectorMultiSelectOriginsByNode';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueVectorMultiSelectResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorMultiSelectResizeDragRef: RefObject<TVectorMultiSelectResizeDragState | null>,
): void => {
  const dragState = vectorMultiSelectResizeDragRef.current;

  if (dragState) {
    const state = store.getState();
    const nodes: Record<string, TSceneNode> = state.design.pages[state.design.activePageId].nodes;
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const { bounds, handle, rotation } = dragState;
    const { anchor, pivot, scaleX, scaleY } = getVectorMultiSelectResizeScale(bounds, handle, rotation, point);
    const groups = groupVectorMultiSelectOriginsByNode(nodes, vectorEditingNodeIds, dragState.vertexOrigins, dragState.handleOrigins);

    dispatchVectorMultiSelectResizeUpdates(dispatch, nodes, groups, dragState, pivot, rotation, anchor, scaleX, scaleY);

    const scaledBounds = getScaledVectorMultiSelectBounds(bounds, anchor, scaleX, scaleY);
    dragState.liveBounds = repositionRotatedVectorMultiSelectBounds(scaledBounds, dragState.anchor, dragState.anchorWorld, rotation);
    canvas.style.cursor = getRotatedCursorUrl('resize', getResizeCursorAngle(handle, rotation)) ?? canvas.style.cursor;
  }
};
