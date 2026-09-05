// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TSceneNode } from 'types/design/types';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';
import { TVectorMultiSelectOriginGroups } from 'components/Design/Canvas/utils/groupVectorMultiSelectOriginsByNode';

// utils
import { dispatchAsOneGestureIfMultiNode } from 'components/Design/Canvas/utils/dispatchAsOneGestureIfMultiNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { pickOrigins } from './pickOrigins';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';
import { translateVectorHandles } from './translateVectorHandles';
import { translateVectorVertices } from 'components/Design/Canvas/utils/translateVectorVertices';

export const dispatchVectorMultiDragUpdates = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  groups: TVectorMultiSelectOriginGroups,
  dragState: TVectorMultiDragState,
  deltaX: number,
  deltaY: number,
): void => {
  scheduleThrottledDispatch(dragState.dispatchThrottle, () =>
    dispatchAsOneGestureIfMultiNode(dispatch, Object.keys(groups).length, () => {
      Object.entries(groups).forEach(([nodeId, group]) => {
        const node = getVectorEditingNode(nodes, nodeId);

        /* v8 ignore if -- groups only ever contains node ids groupVectorMultiSelectOriginsByNode already resolved against this same `nodes` object, so the lookup can't fail here */
        if (node) {
          const vertices = {
            ...node.vertices,
            ...translateVectorVertices(pickOrigins(dragState.vertexOrigins, group.vertexIds), deltaX, deltaY),
          };
          const segments = translateVectorHandles(node.segments, pickOrigins(dragState.handleOrigins, group.handleKeys), deltaX, deltaY);

          dispatch(updateNode({ changes: { segments, vertices }, id: nodeId }));
        }
      });
    }),
  );
};
