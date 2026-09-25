import { RefObject } from 'react';

// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// store
import { addNode, setSelection } from 'store/design/slice';
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectNodes, selectRenderOrderedNodes, selectRootOrder } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { LineEndpoint, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { handleEscape } from '../handleEscape/handleEscape';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';
import { resolveNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/resolveNewNodeDropTarget';
import { screenToWorld } from 'utils/transform/screenToWorld';

const resolveDropTarget = (canvasRefs: TCanvasRefs, point: TPoint, state: ReturnType<AppStore['getState']>): TNewNodeDropTarget =>
  resolveNewNodeDropTarget(canvasRefs, point, selectRenderOrderedNodes(state), selectNodes(state), selectRootOrder(state));

const createLineNode = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  point: TPoint,
  endPoint: LineEndpoint,
  startPoint: LineEndpoint,
  stroke: string,
  name: string,
  dropTarget: TNewNodeDropTarget,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  const { payload } = dispatch(
    addNode(
      {
        endPoint,
        name,
        parentId: dropTarget.parentId,
        startPoint,
        strokeWidth: LINE_RENDER_STROKE_WIDTH,
        strokes: [makeSolidPaint(stroke)],
        type: NodeType.line,
        ...getLineBoxFromPoints({ x1: Math.round(point.x), x2: Math.round(point.x), y1: Math.round(point.y), y2: Math.round(point.y) }),
      },
      dropTarget.targetIndex,
    ),
  );

  nodeIdRef.current = payload.id;
  dispatch(setSelection([payload.id]));
  canvas.setPointerCapture(event.pointerId);
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
  lastPointerClientPositionRef: RefObject<TPoint | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
  endPoint: LineEndpoint,
  startPoint: LineEndpoint,
  stroke: string,
  name: string,
): void => {
  lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };

  if (event.button === MouseButton.primary) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));

    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const state = appStore.getState();

    startRef.current = point;
    dropTargetRef.current = resolveDropTarget(canvasRefs, point, state);

    createLineNode(
      canvas,
      event,
      dispatch,
      canvasRefs,
      point,
      endPoint,
      startPoint,
      stroke,
      name,
      dropTargetRef.current,
      startRef,
      nodeIdRef,
      dropTargetRef,
    );
  }
};
