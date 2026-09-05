import { RefObject } from 'react';

// store
import { selectNodes } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
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
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
): void => {
  if (event.button === MouseButton.primary) {
    dispatch(setSelection([]));
    startRef.current = screenToWorld(getPointerPosition(canvas, event), viewport);
    candidateShapesRef.current = getCandidateShapes(selectNodes(appStore.getState()), []);
    canvas.setPointerCapture(event.pointerId);
  }
};
