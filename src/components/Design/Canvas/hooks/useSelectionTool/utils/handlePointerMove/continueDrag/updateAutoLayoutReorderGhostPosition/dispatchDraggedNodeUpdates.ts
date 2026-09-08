// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TDragState, TNodeOrigin } from 'types/design/selectionTool/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { getGeometryDeltaChanges } from '../../../../../../utils/getGeometryDeltaChanges';
import { resyncGroupAutoLayoutAncestors } from '../../../handlePointerUp/resyncGroupAutoLayoutAncestors';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';

const dispatchNodeOriginUpdates = (
  dispatch: AppDispatch,
  nodeOrigins: Record<string, TNodeOrigin>,
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
): void => {
  Object.entries(nodeOrigins).forEach(([id, origin]) => {
    if (!snapshots?.has(id)) {
      dispatch(updateNode({ changes: getGeometryDeltaChanges(origin, deltaX, deltaY), id }));
    }
  });
};

export const dispatchDraggedNodeUpdates = (
  dispatch: AppDispatch,
  dragState: TDragState,
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
): void => {
  scheduleThrottledDispatch(dragState.dispatchThrottle, () => {
    dispatchNodeOriginUpdates(dispatch, dragState.nodeOrigins, snapshots, deltaX, deltaY);
    resyncGroupAutoLayoutAncestors(dispatch, Object.keys(dragState.nodeOrigins));
  });
};
