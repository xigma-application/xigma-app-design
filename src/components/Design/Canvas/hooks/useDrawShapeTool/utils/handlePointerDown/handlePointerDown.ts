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
import { buildShapeNode } from './buildShapeNode';
import { getCandidateShapes, type TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { handleEscape } from '../handleEscape/handleEscape';
import { resolveNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/resolveNewNodeDropTarget';
import { resolveSectionNewNodeTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/resolveSectionNewNodeTarget';
import { screenToWorld } from 'utils/transform/screenToWorld';

const createShapeNode = (
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  point: TPoint,
  fill: string,
  name: string,
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section | NodeType.slice,
  dropTarget: TNewNodeDropTarget | null,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  const rect = { height: MIN_SHAPE_SIZE, width: MIN_SHAPE_SIZE, x: point.x, y: point.y };
  const node = buildShapeNode(rect, fill, name, type, dropTarget?.parentId ?? null);
  const { payload } = dispatch(addNode(node, dropTarget?.targetIndex));

  nodeIdRef.current = payload.id;
  candidateShapesRef.current = getCandidateShapes(selectNodes(appStore.getState()), [payload.id]);
  dispatch(setSelection([payload.id]));
  canvasRefs.drawing.cancelDrawRef.current = (): void => handleEscape(dispatch, canvasRefs, startRef, nodeIdRef, dropTargetRef);
};

const resolveShapeDropTarget = (
  canvasRefs: TCanvasRefs,
  appStore: AppStore,
  point: TPoint,
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section | NodeType.slice,
): TNewNodeDropTarget | null => {
  const state = appStore.getState();

  switch (type) {
    case NodeType.slice:
      return null;
    case NodeType.section:
      return resolveSectionNewNodeTarget(canvasRefs, point, selectRenderOrderedNodes(state));
    default:
      return resolveNewNodeDropTarget(canvasRefs, point, selectRenderOrderedNodes(state), selectNodes(state), selectRootOrder(state));
  }
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
  fill: string,
  name: string,
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section | NodeType.slice,
): void => {
  if (event.button === MouseButton.primary) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);

    startRef.current = point;
    canvas.setPointerCapture(event.pointerId);
    dropTargetRef.current = resolveShapeDropTarget(canvasRefs, appStore, point, type);
    createShapeNode(
      dispatch,
      appStore,
      canvasRefs,
      point,
      fill,
      name,
      type,
      dropTargetRef.current,
      startRef,
      nodeIdRef,
      candidateShapesRef,
      dropTargetRef,
    );
  }
};
