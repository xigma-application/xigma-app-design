// store
import { getNodeAxisAlignedBounds } from 'store/design/utils/getNodeAxisAlignedBounds';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs, TVectorNodeDragSnapshot } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { dispatchDraggedNodeUpdates } from './dispatchDraggedNodeUpdates';

export const updateAutoLayoutReorderGhostPosition = (
  canvasRefs: TCanvasRefs,
  selectedNodes: TSceneNode[],
  dispatch: AppDispatch,
  dragState: TDragState,
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
): void => {
  const preview = canvasRefs.transform.autoLayoutReorderPreviewRef.current;
  const isSingleNodeReorder = preview !== null && selectedNodes.length === 1;

  if (isSingleNodeReorder && preview) {
    const [draggedNode] = selectedNodes;
    const bounds = getNodeAxisAlignedBounds(draggedNode);

    canvasRefs.transform.autoLayoutReorderPreviewRef.current = {
      ...preview,
      positions: { ...preview.positions, [draggedNode.id]: { x: bounds.x + deltaX, y: bounds.y + deltaY } },
    };
  } else {
    dispatchDraggedNodeUpdates(dispatch, dragState, snapshots, deltaX, deltaY);
  }
};
