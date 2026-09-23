// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropTarget } from '../../handlePointerMove/continueDrag/updateDragDropTarget/armAutoLayoutDropTarget/armAutoLayoutDropTarget';
import { armGridDropTarget } from '../../handlePointerMove/continueDrag/updateDragDropTarget/armGridDropTarget/armGridDropTarget';
import { getDropNodeOrder } from '../../getDropNodeOrder';
import { getNearestNodeId } from '../../handlePointerDown/armDrag/getNearestNodeId';
import { getSelectionBounds } from 'components/Design/Canvas/utils/getSelectionBounds';
import { isAutoLayoutFrame } from '../../handlePointerMove/continueDrag/updateDragDropTarget/isAutoLayoutFrame';
import { isGridFrame } from '../../handlePointerMove/continueDrag/updateDragDropTarget/isGridFrame';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const getDeferredDropPoint = (frame: TDraftRect, groupNodes: TSceneNode[], delta: TPoint): TPoint => {
  const bounds = getSelectionBounds(groupNodes);

  return {
    x: clamp(bounds.x + bounds.width / 2 + delta.x, frame.x, frame.x + frame.width),
    y: clamp(bounds.y + bounds.height / 2 + delta.y, frame.y, frame.y + frame.height),
  };
};

export const armDeferredGroupDropTarget = (canvasRefs: TCanvasRefs, groupIds: string[], delta: TPoint): void => {
  const page = selectActivePage(store.getState());
  const groupNodes = groupIds.map((id) => page.nodes[id]).filter(Boolean);
  const parent = groupNodes[0]?.parentId ? page.nodes[groupNodes[0].parentId] : null;

  const gridParent = isGridFrame(parent) ? parent : null;
  const autoLayoutParent = isAutoLayoutFrame(parent) ? parent : null;

  if (gridParent) {
    canvasRefs.transform.dropTargetFrameIdRef.current = gridParent.id;
    armGridDropTarget(
      canvasRefs,
      gridParent,
      gridParent.id,
      getDropNodeOrder(groupIds, gridParent, page.rootOrder),
      page.nodes,
      getDeferredDropPoint(gridParent, groupNodes, delta),
    );
  } else if (autoLayoutParent) {
    const point = getDeferredDropPoint(autoLayoutParent, groupNodes, delta);

    canvasRefs.transform.dropTargetFrameIdRef.current = autoLayoutParent.id;
    armAutoLayoutDropTarget(
      canvasRefs,
      autoLayoutParent,
      autoLayoutParent.id,
      autoLayoutParent.id,
      groupNodes,
      groupIds,
      page.nodes,
      point,
      getNearestNodeId(groupIds, page.nodes, point),
      false,
    );
  }
};
