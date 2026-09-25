// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { commitSectionCapture } from 'components/Design/Canvas/utils/sectionCapture/commitSectionCapture';

export const commitResizedSectionCapture = (dispatch: AppDispatch, resizeDragState: TResizeDragState, canvasRefs: TCanvasRefs): void => {
  const originEntries = Object.entries(resizeDragState.nodeOrigins);
  const [firstEntry] = originEntries;

  if (originEntries.length === 1 && 'width' in firstEntry[1]) {
    const [id, { height, width, x, y }] = firstEntry;
    commitSectionCapture(dispatch, canvasRefs, id, { height, width, x, y });
  }

  canvasRefs.transform.sectionCaptureIdsRef.current = [];
};
