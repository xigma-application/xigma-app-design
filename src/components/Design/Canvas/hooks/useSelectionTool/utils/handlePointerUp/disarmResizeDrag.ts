import { RefObject } from 'react';

// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { clearResizeOriginalFills } from '../handlePointerMove/continueResizeDrag/resizeNode/resizeOriginalFillsCache';
import { commitResizedVectorNodeSnapshots } from './commitResizedVectorNodeSnapshots';

const commitImageEditorCropModeTransition = (dispatch: AppDispatch, resizeDragState: TResizeDragState): void => {
  const imageEditor = selectImageEditor(store.getState());

  if (imageEditor && imageEditor.mode !== 'crop' && imageEditor.nodeId in resizeDragState.nodeOrigins) {
    dispatch(setImageEditor({ ...imageEditor, mode: 'crop' }));
  }
};

export const disarmResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  resizeDragRef: RefObject<TResizeDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const resizeDragState = resizeDragRef.current;

  if (resizeDragState) {
    commitResizedVectorNodeSnapshots(dispatch, resizeDragState, canvasRefs);
    commitImageEditorCropModeTransition(dispatch, resizeDragState);
    Object.keys(resizeDragState.nodeOrigins).forEach(clearResizeOriginalFills);
    canvasRefs.transform.resizedNodeIdsRef.current = null;
    canvasRefs.transform.alignmentGuideRef.current = null;
    canvasRefs.transform.aspectRatioLockGuideRef.current = null;
    resizeDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
