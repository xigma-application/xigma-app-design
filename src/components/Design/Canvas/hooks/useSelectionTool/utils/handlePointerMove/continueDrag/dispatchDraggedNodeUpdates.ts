// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TDragState } from 'types/design/selectionTool/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { getGeometryDeltaChanges } from '../../../../../utils/getGeometryDeltaChanges';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';

export const dispatchDraggedNodeUpdates = (
  dispatch: AppDispatch,
  dragState: TDragState,
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
): void => {
  scheduleThrottledDispatch(dragState.dispatchThrottle, () =>
    Object.entries(dragState.nodeOrigins).forEach(([id, origin]) => {
      if (!snapshots?.has(id)) {
        dispatch(updateNode({ changes: getGeometryDeltaChanges(origin, deltaX, deltaY), id }));
      }
    }),
  );
};
