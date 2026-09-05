import { RefObject } from 'react';

// store
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectNodes } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getCandidateShapes, type TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
): void => {
  if (event.button === MouseButton.primary) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));
    dispatch(setSelection([]));
    startRef.current = screenToWorld(getPointerPosition(canvas, event), viewport);
    candidateShapesRef.current = getCandidateShapes(selectNodes(appStore.getState()), []);
    canvas.setPointerCapture(event.pointerId);
  }
};
