// store
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs, TVectorNodeDragSnapshot } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { dispatchDraggedNodeUpdates } from './dispatchDraggedNodeUpdates';

const getDraggedNodeGhostPositions = (selectedNodes: TSceneNode[], deltaX: number, deltaY: number): Record<string, TPoint> =>
  selectedNodes.reduce<Record<string, TPoint>>((positionsById, node) => {
    const bounds = getRotatedNodeBounds(node);
    positionsById[node.id] = { x: bounds.x + deltaX, y: bounds.y + deltaY };

    return positionsById;
  }, {});

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

  if (preview) {
    canvasRefs.transform.autoLayoutReorderPreviewRef.current = {
      ...preview,
      positions: { ...preview.positions, ...getDraggedNodeGhostPositions(selectedNodes, deltaX, deltaY) },
    };
  } else {
    dispatchDraggedNodeUpdates(dispatch, dragState, snapshots, deltaX, deltaY);
  }
};
