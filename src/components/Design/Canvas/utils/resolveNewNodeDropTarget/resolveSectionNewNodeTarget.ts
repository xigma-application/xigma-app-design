// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TNewNodeDropTarget } from './types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { clearNewNodeDropTarget } from './clearNewNodeDropTarget';
import { getSectionAtWorldPoint } from '../getSectionAtWorldPoint';

export const resolveSectionNewNodeTarget = (
  canvasRefs: TCanvasRefs,
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
): TNewNodeDropTarget | null => {
  const section = getSectionAtWorldPoint(point, renderOrderedNodes);

  clearNewNodeDropTarget(canvasRefs);

  if (section) {
    canvasRefs.transform.dropTargetFrameIdRef.current = section.id;
    return { parentId: section.id, targetIndex: section.childIds.length };
  }

  return null;
};
