import { RefObject } from 'react';

// store
import { deleteNode, setActiveTool } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// types
import { TArmedMedia } from '../loadArmedMedia';
import { TAspectRatioLockGuide, TPoint } from 'types/canvas';
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';

// utils
import { clearNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/clearNewNodeDropTarget';

export const handleEscape = (
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  armedRef: RefObject<TArmedMedia | null>,
  queueRef: RefObject<File[]>,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  dropTargetRef: RefObject<TNewNodeDropTarget | null>,
  aspectRatioLockGuideRef: RefObject<TAspectRatioLockGuide | null>,
): void => {
  dispatch(deleteNode(nodeIdRef.current as string));
  dispatch(endHistoryGesture());
  clearNewNodeDropTarget(canvasRefs);

  startRef.current = null;
  nodeIdRef.current = null;
  dropTargetRef.current = null;
  aspectRatioLockGuideRef.current = null;
  armedRef.current = null;
  queueRef.current = [];
  canvasRefs.drawing.cancelDrawRef.current = null;
  dispatch(setActiveTool(ToolName.default));
};
