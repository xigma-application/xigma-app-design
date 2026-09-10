// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getOverriddenGridDragAncestor } from './getOverriddenGridDragAncestor';

export const getGridDragRenderNode = <T extends TSceneNode>(refs: TCanvasRefs, node: T, nodesById: Record<string, TSceneNode>): T => {
  const offset = getOverriddenGridDragAncestor(refs.transform.gridDragGhostRef, node, nodesById);

  if (offset) {
    return { ...node, ...getGeometryDeltaChanges(node, offset.x, offset.y) } as T;
  }

  return node;
};
