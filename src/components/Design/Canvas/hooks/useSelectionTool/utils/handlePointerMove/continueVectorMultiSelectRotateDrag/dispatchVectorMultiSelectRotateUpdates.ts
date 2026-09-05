// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TSceneNode } from 'types/design/types';
import { TVectorMultiSelectOriginGroups } from 'components/Design/Canvas/utils/groupVectorMultiSelectOriginsByNode';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

// utils
import { dispatchAsOneGestureIfMultiNode } from 'components/Design/Canvas/utils/dispatchAsOneGestureIfMultiNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { pickOrigins } from './pickOrigins';
import { rotateVectorHandles } from './rotateVectorHandles';
import { rotateVectorVertices } from './rotateVectorVertices';

export const dispatchVectorMultiSelectRotateUpdates = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  groups: TVectorMultiSelectOriginGroups,
  dragState: TVectorMultiSelectRotateDragState,
  deltaDegrees: number,
): void => {
  dispatchAsOneGestureIfMultiNode(dispatch, Object.keys(groups).length, () => {
    Object.entries(groups).forEach(([nodeId, group]) => {
      const node = getVectorEditingNode(nodes, nodeId);

      /* v8 ignore if -- groups only ever contains node ids groupVectorMultiSelectOriginsByNode already resolved against this same `nodes` object, so the lookup can't fail here */
      if (node) {
        const vertexOrigins = pickOrigins(dragState.vertexOrigins, group.vertexIds);
        const handleOrigins = pickOrigins(dragState.handleOrigins, group.handleKeys);
        const vertices = { ...node.vertices, ...rotateVectorVertices(vertexOrigins, dragState.pivot, deltaDegrees) };
        const segments = rotateVectorHandles(node.segments, handleOrigins, deltaDegrees);

        dispatch(updateNode({ changes: { segments, vertices }, id: nodeId }));
      }
    });
  });
};
