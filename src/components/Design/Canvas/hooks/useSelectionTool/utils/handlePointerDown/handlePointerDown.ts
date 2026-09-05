// others
import { ARM_RESOLVERS } from './constants';

// store
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import {
  selectActiveTool,
  selectOrderedNodes,
  selectSelectedIds,
  selectSelectedNodes,
  selectSmartSelectionNodes,
  selectViewport,
} from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TArmContext } from './types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getSelectionHitAtPoint } from './getSelectionHitAtPoint/getSelectionHitAtPoint';
import { isControlPressed } from 'utils/isControlPressed';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (event.button === MouseButton.primary) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const selectedNodes = selectSelectedNodes(state);
    const orderedNodes = selectOrderedNodes(state);
    const ctx: TArmContext = {
      activeTool: selectActiveTool(state),
      canvas,
      canvasRefs,
      currentSelection: selectSelectedIds(state),
      dispatch,
      event,
      hit: getSelectionHitAtPoint(point, orderedNodes, viewport),
      orderedNodes,
      point,
      selectedNodes,
      selectionRefs,
      setClassName,
      smartSelectionNodes: selectSmartSelectionNodes(state),
      viewport,
    };

    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));

    for (const resolve of ARM_RESOLVERS) {
      if (resolve(ctx)) {
        if (isControlPressed(event) && selectionRefs.dragStateRef.current) {
          selectionRefs.dragStateRef.current.ctrlMarqueeFallback = ctx.currentSelection;
        }

        return;
      }
    }
  }
};
