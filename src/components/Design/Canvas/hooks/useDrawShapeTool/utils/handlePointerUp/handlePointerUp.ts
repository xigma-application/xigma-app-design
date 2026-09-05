import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';
import { DEFAULT_SHAPE_SIZE } from '../../../../constants';

// store
import { setActiveTool } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch, AppStore } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { dispatchShapeNode } from './dispatchShapeNode';
import { getPointAlignmentSnap } from '../../../../utils/getPointAlignmentSnap';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { selectLastCreatedNode } from '../../../../utils/selectLastCreatedNode';
import { toDraftRectWithDefault } from '../../../../utils/toDraftRectWithDefault';

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
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section,
): void => {
  if (startRef.current) {
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const snap = getPointAlignmentSnap(rawPoint, candidateShapesRef.current, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom);
    const rect = toDraftRectWithDefault(startRef.current, snap.point, DEFAULT_SHAPE_SIZE, true, viewport.zoom, event.shiftKey);

    dispatchShapeNode(dispatch, rect, fill, name, type);
    selectLastCreatedNode(dispatch, appStore);

    startRef.current = null;
    canvasRefs.draftRef.current = null;
    canvasRefs.transform.alignmentGuideRef.current = null;
    canvasRefs.transform.aspectRatioLockGuideRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    dispatch(setActiveTool(ToolName.default));
  }

  dispatch(endHistoryGesture());
};
