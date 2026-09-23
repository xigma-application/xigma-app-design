import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';
import { DEFAULT_SHAPE_SIZE } from 'components/Design/Canvas/constants';

// store
import { selectNodes } from 'store/design/selectors';
import { setActiveTool, startTextEdit, updateNode } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch, AppStore } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';
import { TTextNode, TViewport } from 'types/design/types';

// utils
import { clearNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/clearNewNodeDropTarget';
import { getPointAlignmentSnap } from 'components/Design/Canvas/utils/getPointAlignmentSnap';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { toDraftRectWithDefault } from 'components/Design/Canvas/utils/toDraftRectWithDefault';

const startTextEditAtResolvedPosition = (dispatch: AppDispatch, appStore: AppStore, nodeId: string): void => {
  const node = selectNodes(appStore.getState())[nodeId] as TTextNode;

  dispatch(
    startTextEdit({
      box: { flipX: node.flipX, flipY: node.flipY, height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y },
      id: nodeId,
    }),
  );
};

const resetDrawRefs = (
  canvasRefs: TCanvasRefs,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  startRef.current = null;
  nodeIdRef.current = null;
  dropTargetRef.current = null;
  canvasRefs.transform.alignmentGuideRef.current = null;
  canvasRefs.drawing.cancelDrawRef.current = null;
};

export const handlePointerUp = (
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
  if (startRef.current && nodeIdRef.current) {
    const { current } = startRef;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const tolerance = ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom;
    const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, tolerance);
    const zoom = viewport.zoom;
    const { point } = snap;
    const rect = toDraftRectWithDefault(current, point, DEFAULT_SHAPE_SIZE, false, zoom);

    dispatch(updateNode({ changes: rect, id: nodeIdRef.current }));
    startTextEditAtResolvedPosition(dispatch, appStore, nodeIdRef.current);
    resetDrawRefs(canvasRefs, startRef, nodeIdRef, dropTargetRef);
    clearNewNodeDropTarget(canvasRefs);
    canvas.releasePointerCapture(event.pointerId);
    dispatch(setActiveTool(ToolName.default));
  }

  dispatch(endHistoryGesture());
};
