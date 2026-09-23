import { RefObject } from 'react';

// others
import { MIN_SHAPE_SIZE } from 'components/Design/Canvas/constants';

// store
import { deleteNode, setActiveTool, updateNode } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { clearNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/clearNewNodeDropTarget';
import { getAngleSnappedVectorPoint } from 'utils/canvas/vectorNetwork/getAngleSnappedVectorPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  if (startRef.current && nodeIdRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), viewport);
    const { point } = getAngleSnappedVectorPoint(startRef.current, current, viewport.zoom, event.shiftKey);
    const length = Math.hypot(point.x - startRef.current.x, point.y - startRef.current.y);

    if (length >= MIN_SHAPE_SIZE) {
      dispatch(updateNode({ changes: { x2: Math.round(point.x), y2: Math.round(point.y) }, id: nodeIdRef.current }));
    } else {
      dispatch(deleteNode(nodeIdRef.current));
    }

    startRef.current = null;
    nodeIdRef.current = null;
    dropTargetRef.current = null;
    canvasRefs.drawing.cancelDrawRef.current = null;
    clearNewNodeDropTarget(canvasRefs);
    canvas.releasePointerCapture(event.pointerId);
    dispatch(setActiveTool(ToolName.default));
  }

  dispatch(endHistoryGesture());
};
