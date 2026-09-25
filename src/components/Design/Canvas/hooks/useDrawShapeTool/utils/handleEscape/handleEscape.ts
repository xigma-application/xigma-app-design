import { RefObject } from 'react';

// store
import { deleteNode, setActiveTool } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';

// utils
import { clearNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/clearNewNodeDropTarget';

export const handleEscape = (
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
): void => {
  dispatch(deleteNode(nodeIdRef.current as string));
  dispatch(endHistoryGesture());
  clearNewNodeDropTarget(canvasRefs);

  startRef.current = null;
  nodeIdRef.current = null;
  dropTargetRef.current = null;
  canvasRefs.transform.alignmentGuideRef.current = null;
  canvasRefs.transform.aspectRatioLockGuideRef.current = null;
  canvasRefs.transform.sectionCaptureIdsRef.current = [];
  canvasRefs.drawing.cancelDrawRef.current = null;
  dispatch(setActiveTool(ToolName.default));
};
