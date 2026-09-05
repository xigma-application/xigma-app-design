import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';
import { DEFAULT_SHAPE_SIZE } from 'components/Design/Canvas/constants';

// store
import { addNode, setActiveTool } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch, AppStore } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getPointAlignmentSnap } from 'components/Design/Canvas/utils/getPointAlignmentSnap';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { selectLastCreatedNode } from 'components/Design/Canvas/utils/selectLastCreatedNode';
import { TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { toDraftRectWithDefault } from 'components/Design/Canvas/utils/toDraftRectWithDefault';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  candidateShapesRef: RefObject<TCandidateShape[]>,
  fill: string,
  name: string,
  points: number,
  ratio: number,
): void => {
  const { draftRef } = canvasRefs;
  const { alignmentGuideRef, aspectRatioLockGuideRef } = canvasRefs.transform;

  if (startRef.current) {
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
    const rect = toDraftRectWithDefault(startRef.current, snap.point, DEFAULT_SHAPE_SIZE, true, viewport.zoom, event.shiftKey);
    const flip = { flipX: false, flipY: false };
    const nodeType = NodeType.star as const;
    const rest = { name, parentId: null, points, ratio, rotation: 0 };
    const data = { ...rect, ...flip, ...rest, fill, type: nodeType };

    dispatch(addNode(data));
    selectLastCreatedNode(dispatch, appStore);

    startRef.current = null;
    draftRef.current = null;
    alignmentGuideRef.current = null;
    aspectRatioLockGuideRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    dispatch(setActiveTool(ToolName.default));
  }

  dispatch(endHistoryGesture());
};
