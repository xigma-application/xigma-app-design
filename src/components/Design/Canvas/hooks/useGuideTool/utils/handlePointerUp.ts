// store
import { addGuide, deleteGuide, updateGuide } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { selectAreRulersVisible, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectedGuide } from '../types';

// utils
import { getGutterAxis } from './getGutterAxis';
import { getPointerPosition } from '../../../utils/getPointerPosition';
import { screenToWorld } from '../../../utils/screenToWorld';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  setSelectedGuide: (selected: TSelectedGuide | null) => void,
): void => {
  const dragging = refs.guides.draggingGuideRef.current;

  if (!dragging) {
    return;
  }

  const pointer = getPointerPosition(canvas, event);
  const state = store.getState();
  const droppedInGutter = getGutterAxis(pointer, selectAreRulersVisible(state), refs.layout.leftPanelWidthRef.current) !== null;

  if (dragging.id !== null && !dragging.hasMoved) {
    setSelectedGuide({ frameId: dragging.frameId, id: dragging.id, worldPoint: screenToWorld(pointer, selectViewport(state)) });
  } else if (dragging.id === null) {
    if (!droppedInGutter) {
      dispatch(addGuide({ axis: dragging.axis, frameId: dragging.frameId, position: dragging.position }));
    }
  } else if (droppedInGutter) {
    dispatch(deleteGuide({ frameId: dragging.frameId, id: dragging.id }));
  } else {
    dispatch(updateGuide({ frameId: dragging.frameId, id: dragging.id, position: dragging.position }));
  }

  dispatch(endHistoryGesture());
  refs.guides.draggingGuideRef.current = null;
  canvas.releasePointerCapture(event.pointerId);
  event.stopImmediatePropagation();
};
