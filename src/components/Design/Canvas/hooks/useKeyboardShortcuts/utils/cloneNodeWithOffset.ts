// components
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';

// types
import { NodeType } from 'types/design/enums';
import { TNewSceneNode, TSceneNode } from 'types/design/types';

export const cloneNodeWithOffset = (node: TSceneNode, offsetX: number, offsetY: number): TNewSceneNode => {
  const changes = getGeometryDeltaChanges(node, offsetX, offsetY);
  const clone = { ...structuredClone(node), ...changes } as TNewSceneNode;

  if (clone.type === NodeType.text) {
    clone.pathId = null;
  }

  return clone;
};
