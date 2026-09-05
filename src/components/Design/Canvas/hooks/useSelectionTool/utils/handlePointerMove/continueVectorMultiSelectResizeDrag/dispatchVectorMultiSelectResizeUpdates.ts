// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TVectorMultiSelectOriginGroups } from 'components/Design/Canvas/utils/groupVectorMultiSelectOriginsByNode';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';

// utils
import { dispatchAsOneGestureIfMultiNode } from 'components/Design/Canvas/utils/dispatchAsOneGestureIfMultiNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { pickOrigins } from './pickOrigins';
import { scaleVectorHandles } from './scaleVectorHandles';
import { scaleVectorVertices } from './scaleVectorVertices';

export const dispatchVectorMultiSelectResizeUpdates = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  groups: TVectorMultiSelectOriginGroups,
  dragState: TVectorMultiSelectResizeDragState,
  pivot: TPoint,
  rotation: number,
  anchor: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): void => {
  dispatchAsOneGestureIfMultiNode(dispatch, Object.keys(groups).length, () => {
    Object.entries(groups).forEach(([nodeId, group]) => {
      const node = getVectorEditingNode(nodes, nodeId);

      /* v8 ignore if -- groups only ever contains node ids groupVectorMultiSelectOriginsByNode already resolved against this same `nodes` object, so the lookup can't fail here */
      if (node) {
        const vertexOrigins = pickOrigins(dragState.vertexOrigins, group.vertexIds);
        const handleOrigins = pickOrigins(dragState.handleOrigins, group.handleKeys);
        const vertices = { ...node.vertices, ...scaleVectorVertices(vertexOrigins, pivot, rotation, anchor, scaleX, scaleY) };
        const segments = scaleVectorHandles(node.segments, handleOrigins, rotation, scaleX, scaleY);

        dispatch(updateNode({ changes: { segments, vertices }, id: nodeId }));
      }
    });
  });
};
