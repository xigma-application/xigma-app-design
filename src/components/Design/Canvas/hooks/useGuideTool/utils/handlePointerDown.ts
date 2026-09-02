// store
import { beginHistoryGesture } from 'store/history/actions';
import { selectAllGuideLines, selectAreRulersVisible, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getGuideAtPoint } from './getGuideAtPoint';
import { getGutterAxis } from './getGutterAxis';
import { getPointerPosition } from '../../../utils/getPointerPosition';
import { screenToWorld } from '../../../utils/screenToWorld';

export const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent, dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const pointer = getPointerPosition(canvas, event);
  const state = store.getState();
  const viewport = selectViewport(state);
  const gutterAxis = getGutterAxis(pointer, selectAreRulersVisible(state));

  if (gutterAxis) {
    const worldPoint = screenToWorld(pointer, viewport);

    refs.guides.draggingGuideRef.current = {
      axis: gutterAxis,
      frameId: null,
      id: null,
      position: gutterAxis === 'x' ? worldPoint.x : worldPoint.y,
    };
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    canvas.setPointerCapture(event.pointerId);
    event.stopImmediatePropagation();
    return;
  }

  const hitGuide = getGuideAtPoint(pointer, selectAllGuideLines(state), viewport);

  if (hitGuide) {
    refs.guides.draggingGuideRef.current = {
      axis: hitGuide.axis,
      frameId: hitGuide.frameId,
      id: hitGuide.id,
      position: hitGuide.worldPosition,
    };
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    canvas.setPointerCapture(event.pointerId);
    event.stopImmediatePropagation();
  }
};
