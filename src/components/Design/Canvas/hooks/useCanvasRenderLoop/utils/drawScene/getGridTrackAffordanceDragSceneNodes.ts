// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getGridTrackAffordanceDragOffset } from 'utils/canvas/gridSlots/getGridTrackAffordanceDragOffset';
import { getGridTrackAffordanceOffsetNodesById } from 'utils/canvas/gridSlots/getGridTrackAffordanceOffsetNodesById';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';

export type TGridTrackAffordanceDragSceneNodes = {
  nodesById: Record<string, TSceneNode>;
  sceneNodes: TSceneNode[];
};

export const getGridTrackAffordanceDragSceneNodes = (
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
  sceneNodes: TSceneNode[],
): TGridTrackAffordanceDragSceneNodes => {
  const dragState = refs.transform.gridTrackAffordanceDragRef.current;
  const frame = dragState ? nodesById[dragState.frameId] : null;

  if (dragState && dragState.hasMoved && frame && frame.type === NodeType.frame) {
    const layout = getGridTrackLayout(frame, nodesById);
    const offset = getGridTrackAffordanceDragOffset(frame, layout, dragState);
    const offsetNodesById = getGridTrackAffordanceOffsetNodesById(frame, nodesById, dragState, offset);

    if (offsetNodesById !== nodesById) {
      return { nodesById: offsetNodesById, sceneNodes: sceneNodes.map((node) => offsetNodesById[node.id] ?? node) };
    }
  }

  return { nodesById, sceneNodes };
};
