// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs, TVectorNodeDragSnapshot } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { dispatchDraggedNodeUpdates } from './dispatchDraggedNodeUpdates';
import { getDraggedNodeGhostPositions } from './getDraggedNodeGhostPositions/getDraggedNodeGhostPositions';

export const updateAutoLayoutReorderGhostPosition = (
  canvasRefs: TCanvasRefs,
  selectedNodes: TSceneNode[],
  dispatch: AppDispatch,
  dragState: TDragState,
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
): void => {
  const previewRef = canvasRefs.transform.autoLayoutReorderPreviewRef;
  const preview = previewRef.current;

  if (preview) {
    const { positions, tween } = getDraggedNodeGhostPositions(previewRef, selectedNodes, preview, deltaX, deltaY);
    previewRef.current = { ...preview, draggedOffsetTween: tween, positions: { ...preview.positions, ...positions } };
  } else {
    dispatchDraggedNodeUpdates(dispatch, dragState, snapshots, deltaX, deltaY);
  }
};
