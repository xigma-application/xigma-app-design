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
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';
import { TNewSceneNode, TViewport } from 'types/design/types';

// utils
import { clearNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/clearNewNodeDropTarget';
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
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
  fill: string,
  name: string,
  sides: number,
): void => {
  const { draftRef } = canvasRefs;
  const { alignmentGuideRef, aspectRatioLockGuideRef } = canvasRefs.transform;

  if (startRef.current) {
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
    const rect = toDraftRectWithDefault(startRef.current, snap.point, DEFAULT_SHAPE_SIZE, true, viewport.zoom, event.shiftKey);
    const parentId = dropTargetRef.current?.parentId ?? null;
    const node = { ...rect, fill, flipX: false, flipY: false, name, parentId, rotation: 0, sides, type: NodeType.polygon };

    dispatch(addNode(node as TNewSceneNode, dropTargetRef.current?.targetIndex));
    selectLastCreatedNode(dispatch, appStore);

    startRef.current = null;
    dropTargetRef.current = null;
    draftRef.current = null;
    alignmentGuideRef.current = null;
    aspectRatioLockGuideRef.current = null;
    clearNewNodeDropTarget(canvasRefs);
    canvas.releasePointerCapture(event.pointerId);
    dispatch(setActiveTool(ToolName.default));
  }

  dispatch(endHistoryGesture());
};
