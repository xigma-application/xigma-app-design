// others
import { ARM_RESOLVERS } from './constants';

// store
import { beginHistoryGesture } from 'store/history/actions';
import { selectActiveTool, selectOrderedNodes, selectSelectedIds, selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TArmContext } from './types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getSelectionHitAtPoint } from './getSelectionHitAtPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { snapshotVectorFaceFills } from '../vectorFaceFillRemap/snapshotVectorFaceFills';

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
      viewport,
    };

    dispatch(beginHistoryGesture());
    selectionRefs.vectorFaceFillSnapshotRef.current = snapshotVectorFaceFills(state);

    for (const resolve of ARM_RESOLVERS) {
      if (resolve(ctx)) {
        return;
      }
    }
  }
};
