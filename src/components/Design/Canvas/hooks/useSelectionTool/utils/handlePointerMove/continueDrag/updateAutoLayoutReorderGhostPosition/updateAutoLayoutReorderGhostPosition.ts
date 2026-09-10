// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs, TVectorNodeDragSnapshot } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { dispatchDraggedNodeUpdates } from './dispatchDraggedNodeUpdates';
import { getDraggedNodeGhostPositions } from './getDraggedNodeGhostPositions/getDraggedNodeGhostPositions';
import { isGridFrame } from '../updateDragDropTarget/isGridFrame';

export const updateAutoLayoutReorderGhostPosition = (
  canvasRefs: TCanvasRefs,
  selectedNodes: TSceneNode[],
  dispatch: AppDispatch,
  dragState: TDragState,
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
  nodesById: Record<string, TSceneNode>,
): void => {
  const previewRef = canvasRefs.transform.autoLayoutReorderPreviewRef;
  const preview = previewRef.current;
  const originParentId = selectedNodes[0]?.parentId ?? null;
  const originParent = originParentId ? (nodesById[originParentId] ?? null) : null;

  if (preview) {
    const { positions, tween } = getDraggedNodeGhostPositions(previewRef, selectedNodes, preview, deltaX, deltaY);
    previewRef.current = { ...preview, draggedOffsetTween: tween, positions: { ...preview.positions, ...positions } };
    canvasRefs.transform.gridDragGhostRef.current = null;
  } else if (isGridFrame(originParent)) {
    canvasRefs.transform.gridDragGhostRef.current = { nodeIds: selectedNodes.map((node) => node.id), offset: { x: deltaX, y: deltaY } };
  } else {
    canvasRefs.transform.gridDragGhostRef.current = null;
    dispatchDraggedNodeUpdates(dispatch, dragState, snapshots, deltaX, deltaY);
  }
};
