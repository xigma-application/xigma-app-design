// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

// utils
import { applySplitSegmentClickAction } from './applySplitSegmentClickAction';
import { setExclusiveVectorSelection } from './setExclusiveVectorSelection';

export const applyPendingClickAction = (dispatch: AppDispatch, canvasRefs: TCanvasRefs, dragState: TVectorMultiDragState): void => {
  const { pendingClickAction } = dragState;

  if (pendingClickAction) {
    switch (pendingClickAction.kind) {
      case 'vertex':
        setExclusiveVectorSelection(canvasRefs, { vertexIds: [pendingClickAction.id] });
        break;
      case 'handle':
        setExclusiveVectorSelection(canvasRefs, { handles: [{ end: pendingClickAction.end, segmentId: pendingClickAction.segmentId }] });
        break;
      case 'segment':
        setExclusiveVectorSelection(canvasRefs, { segmentIds: [pendingClickAction.id] });
        break;
      case 'split-segment':
        applySplitSegmentClickAction(dispatch, canvasRefs, dragState.nodeId, pendingClickAction.segmentId, pendingClickAction.t);
        break;
      // no default
    }
  }
};
