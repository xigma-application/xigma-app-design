// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorWidthPoint } from 'types/design/types';
import { TVectorWidthPointDragState } from 'types/design/canvas/types';

// utils
import { dispatchAsOneGestureIfMultiNode } from '../../../../../utils/dispatchAsOneGestureIfMultiNode';

const groupTargetsByNodeId = (drag: TVectorWidthPointDragState): Record<string, TVectorWidthPoint[]> =>
  [{ nodeId: drag.nodeId, point: drag.point }, ...drag.groupTargets].reduce<Record<string, TVectorWidthPoint[]>>(
    (byNodeId, target) => ({ ...byNodeId, [target.nodeId]: [...(byNodeId[target.nodeId] ?? []), target.point] }),
    {},
  );

export const commitVectorWidthPointDrag = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  drag: TVectorWidthPointDragState,
): void => {
  const pointsByNodeId = groupTargetsByNodeId(drag);
  const affectedNodeIds = Object.keys(pointsByNodeId);

  dispatchAsOneGestureIfMultiNode(dispatch, affectedNodeIds.length, () => {
    affectedNodeIds.forEach((nodeId) => {
      const node = nodes[nodeId];

      if (node && node.type === NodeType.vector) {
        dispatch(
          updateNode({
            changes: {
              widthProfile: {
                points: pointsByNodeId[nodeId].reduce((points, point) => ({ ...points, [point.id]: point }), {
                  ...node.widthProfile?.points,
                }),
              },
            },
            id: nodeId,
          }),
        );
      }
    });
  });
};
