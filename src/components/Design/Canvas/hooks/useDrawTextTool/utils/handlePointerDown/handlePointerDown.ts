import { RefObject } from 'react';

// others
import { MIN_SHAPE_SIZE, TEXT_FILL, TEXT_FONT_FAMILY, TEXT_FONT_SIZE, TEXT_NAME } from 'components/Design/Canvas/constants';

// store
import { addNode, setSelection } from 'store/design/slice';
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectNodes, selectRenderOrderedNodes, selectRootOrder } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getCandidateShapes, type TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { handleEscape } from '../handleEscape/handleEscape';
import { resolveNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/resolveNewNodeDropTarget';
import { screenToWorld } from 'utils/transform/screenToWorld';

const resolveDropTarget = (canvasRefs: TCanvasRefs, point: TPoint, state: ReturnType<AppStore['getState']>): TNewNodeDropTarget =>
  resolveNewNodeDropTarget(canvasRefs, point, selectRenderOrderedNodes(state), selectNodes(state), selectRootOrder(state));

const createTextNode = (
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  point: TPoint,
  dropTarget: TNewNodeDropTarget,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  const { payload } = dispatch(
    addNode(
      {
        content: '',
        fill: TEXT_FILL,
        flipX: false,
        flipY: false,
        fontFamily: TEXT_FONT_FAMILY,
        fontSize: TEXT_FONT_SIZE,
        height: MIN_SHAPE_SIZE,
        name: TEXT_NAME,
        parentId: dropTarget.parentId,
        rotation: 0,
        type: NodeType.text,
        width: MIN_SHAPE_SIZE,
        x: point.x,
        y: point.y,
      },
      dropTarget.targetIndex,
    ),
  );

  nodeIdRef.current = payload.id;
  candidateShapesRef.current = getCandidateShapes(selectNodes(appStore.getState()), [payload.id]);
  dispatch(setSelection([payload.id]));
  canvasRefs.drawing.cancelDrawRef.current = (): void => handleEscape(dispatch, canvasRefs, startRef, nodeIdRef, dropTargetRef);
};

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  if (event.button === MouseButton.primary) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));

    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const state = appStore.getState();

    startRef.current = point;
    canvas.setPointerCapture(event.pointerId);
    dropTargetRef.current = resolveDropTarget(canvasRefs, point, state);
    createTextNode(dispatch, appStore, canvasRefs, point, dropTargetRef.current, startRef, nodeIdRef, candidateShapesRef, dropTargetRef);
  }
};
