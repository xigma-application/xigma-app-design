// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

export const getHoistedDragIds = (refs: TCanvasRefs, sceneNodeById: Map<string, TSceneNode>): Set<string> => {
  const dropTarget = refs.transform.autoLayoutDropTargetRef.current;
  const draggedIds = refs.transform.draggedNodeIdsRef.current;

  if (dropTarget && draggedIds) {
    return new Set([...draggedIds].filter((id) => sceneNodeById.has(id)));
  }

  return new Set();
};
