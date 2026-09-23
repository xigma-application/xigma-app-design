import { RefObject } from 'react';

// store
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectNodes, selectRenderOrderedNodes, selectRootOrder } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { clearNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/clearNewNodeDropTarget';
import { getCandidateShapes, type TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { resolveNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/resolveNewNodeDropTarget';
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
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section,
): void => {
  if (event.button === MouseButton.primary) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));
    dispatch(setSelection([]));

    const point = screenToWorld(getPointerPosition(canvas, event), viewport);

    startRef.current = point;
    candidateShapesRef.current = getCandidateShapes(selectNodes(appStore.getState()), []);
    canvas.setPointerCapture(event.pointerId);

    if (type === NodeType.section) {
      dropTargetRef.current = null;
      clearNewNodeDropTarget(canvasRefs);
    } else {
      const state = appStore.getState();

      dropTargetRef.current = resolveNewNodeDropTarget(
        canvasRefs,
        point,
        selectRenderOrderedNodes(state),
        selectNodes(state),
        selectRootOrder(state),
      );
    }
  }
};
