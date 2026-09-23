import { RefObject } from 'react';

// others
import { MIN_SHAPE_SIZE } from 'components/Design/Canvas/constants';

// store
import { setActiveTool, updateNode } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TArmedMedia } from '../loadArmedMedia';
import { TAspectRatioLockGuide, TPoint } from 'types/canvas';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';

// utils
import { armNextFile } from '../armNextFile';
import { clearNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/clearNewNodeDropTarget';
import { getMediaPlacementRect } from './utils/getMediaPlacementRect';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  canvasRefs: TCanvasRefs,
  armedRef: RefObject<TArmedMedia | null>,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
  queueRef: RefObject<File[]>,
  aspectRatioLockGuideRef: RefObject<TAspectRatioLockGuide | null>,
): void => {
  const armed = armedRef.current;

  if (armed && startRef.current && nodeIdRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), selectViewport(appStore.getState()));
    const isClick = Math.abs(current.x - startRef.current.x) < MIN_SHAPE_SIZE && Math.abs(current.y - startRef.current.y) < MIN_SHAPE_SIZE;

    if (!isClick) {
      const rect = getMediaPlacementRect(false, startRef.current, current, armed.naturalWidth, armed.naturalHeight);
      dispatch(updateNode({ changes: rect, id: nodeIdRef.current }));
    }

    startRef.current = null;
    nodeIdRef.current = null;
    dropTargetRef.current = null;
    aspectRatioLockGuideRef.current = null;
    canvasRefs.drawing.cancelDrawRef.current = null;
    clearNewNodeDropTarget(canvasRefs);
    canvas.releasePointerCapture(event.pointerId);

    if (queueRef.current.length > 0) {
      armNextFile(canvasRef, armedRef, queueRef, dispatch);
    } else {
      armedRef.current = null;
      dispatch(setActiveTool(ToolName.default));
    }
  }

  dispatch(endHistoryGesture());
};
