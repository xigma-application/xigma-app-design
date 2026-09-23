import { RefObject } from 'react';

// store
import { addNode } from 'store/design/slice';
import { beginHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectRenderOrderedNodes, selectRootOrder, selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore, RootState } from 'store';

// types
import { MouseButton } from 'types/enums';
import { NodeType } from 'types/design/enums';
import { TArmedMedia } from '../loadArmedMedia';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';

// utils
import { appendLastCreatedNodeToSelection } from '../../../../utils/appendLastCreatedNodeToSelection';
import { getCenteredMediaRect } from '../handlePointerUp/utils/getCenteredMediaRect';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { handleEscape } from '../handleEscape/handleEscape';
import { resolveNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/resolveNewNodeDropTarget';
import { roundRect } from 'utils/math/roundRect';
import { screenToWorld } from 'utils/transform/screenToWorld';

const createArmedMediaNode = (
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  armedRef: RefObject<TArmedMedia | null>,
  armed: TArmedMedia,
  point: TPoint,
  name: string,
  dropTarget: TNewNodeDropTarget,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
  queueRef: RefObject<File[]>,
): void => {
  const rect = roundRect(getCenteredMediaRect(point, armed.naturalWidth, armed.naturalHeight));
  const { payload } = dispatch(
    addNode(
      { ...rect, flipX: false, flipY: false, name, parentId: dropTarget.parentId, rotation: 0, src: armed.src, type: NodeType.media },
      dropTarget.targetIndex,
    ),
  );

  nodeIdRef.current = payload.id;
  appendLastCreatedNodeToSelection(dispatch, appStore);
  canvasRefs.drawing.cancelDrawRef.current = (): void =>
    handleEscape(
      dispatch,
      canvasRefs,
      armedRef,
      queueRef,
      startRef,
      nodeIdRef,
      dropTargetRef,
      canvasRefs.transform.aspectRatioLockGuideRef,
    );
};

const resolveMediaDropTarget = (canvasRefs: TCanvasRefs, point: TPoint, state: RootState): TNewNodeDropTarget =>
  resolveNewNodeDropTarget(canvasRefs, point, selectRenderOrderedNodes(state), selectNodes(state), selectRootOrder(state));

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  armedRef: RefObject<TArmedMedia | null>,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
  queueRef: RefObject<File[]>,
  name: string,
): void => {
  const armed = armedRef.current;

  if (event.button === MouseButton.primary && armed) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));

    const state = appStore.getState();
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));

    startRef.current = point;
    dropTargetRef.current = resolveMediaDropTarget(canvasRefs, point, state);
    createArmedMediaNode(
      dispatch,
      appStore,
      canvasRefs,
      armedRef,
      armed,
      point,
      name,
      dropTargetRef.current,
      startRef,
      nodeIdRef,
      dropTargetRef,
      queueRef,
    );
    canvas.setPointerCapture(event.pointerId);
  }
};
