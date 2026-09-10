// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const AUTO_LAYOUT_DRAG_OPACITY = 0.5;

export const getAutoLayoutDragOpacity = (refs: TCanvasRefs, nodeId: string): number => {
  const { autoLayoutDropTargetRef, gridDropTargetRef } = refs.transform;
  const isDropActive = autoLayoutDropTargetRef.current !== null || gridDropTargetRef.current !== null;
  const isDragged = Boolean(refs.transform.draggedNodeIdsRef.current?.has(nodeId));

  return isDropActive && isDragged ? AUTO_LAYOUT_DRAG_OPACITY : 1;
};
