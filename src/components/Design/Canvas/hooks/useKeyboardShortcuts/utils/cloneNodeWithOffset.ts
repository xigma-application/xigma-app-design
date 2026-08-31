// components
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';

// types
import { TNewSceneNode, TSceneNode } from 'types/design/types';

export const cloneNodeWithOffset = (node: TSceneNode, offsetX: number, offsetY: number): TNewSceneNode => {
  const changes = getGeometryDeltaChanges(node, offsetX, offsetY);

  return { ...structuredClone(node), ...changes } as TNewSceneNode;
};
