import { RefObject } from 'react';

// others
import { MIN_SHAPE_SIZE } from 'components/Design/Canvas/constants';

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

const createStarNode = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  point: TPoint,
  fill: string,
  name: string,
  points: number,
  ratio: number,
  dropTarget: TNewNodeDropTarget,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  const { payload } = dispatch(
    addNode(
      {
        fill,
        flipX: false,
        flipY: false,
        height: MIN_SHAPE_SIZE,
        name,
        parentId: dropTarget.parentId,
        points,
        ratio,
        rotation: 0,
        type: NodeType.star,
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
  canvas.setPointerCapture(event.pointerId);
  canvasRefs.drawing.cancelDrawRef.current = (): void => handleEscape(dispatch, canvasRefs, startRef, nodeIdRef, dropTargetRef);
};

const resolveDropTarget = (canvasRefs: TCanvasRefs, point: TPoint, state: ReturnType<AppStore['getState']>): TNewNodeDropTarget =>
  resolveNewNodeDropTarget(canvasRefs, point, selectRenderOrderedNodes(state), selectNodes(state), selectRootOrder(state));

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
  fill: string,
  name: string,
  points: number,
  ratio: number,
): void => {
  if (event.button === MouseButton.primary) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));

    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const state = appStore.getState();

    startRef.current = point;
    dropTargetRef.current = resolveDropTarget(canvasRefs, point, state);

    createStarNode(
      canvas,
      event,
      dispatch,
      appStore,
      canvasRefs,
      point,
      fill,
      name,
      points,
      ratio,
      dropTargetRef.current,
      startRef,
      nodeIdRef,
      candidateShapesRef,
      dropTargetRef,
    );
  }
};
