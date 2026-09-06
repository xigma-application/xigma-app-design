// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

export const getHoistedDragIds = (refs: TCanvasRefs, sceneNodeById: Map<string, TSceneNode>): Set<string> => {
  const dropTarget = refs.transform.autoLayoutDropTargetRef.current;
  const draggedIds = refs.transform.draggedNodeIdsRef.current;

  if (dropTarget && draggedIds) {
    return new Set(
      [...draggedIds].filter((id) => {
        const node = sceneNodeById.get(id);
        return node !== undefined && !draggedIds.has(node.parentId ?? '');
      }),
    );
  }

  return new Set();
};
