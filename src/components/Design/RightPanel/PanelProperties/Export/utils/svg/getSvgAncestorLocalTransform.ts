// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';
import { TSvgLocalTransform } from './types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getSvgAncestorLocalTransform = (node: TBoxSceneNode, nodesById: Record<string, TSceneNode>): TSvgLocalTransform => {
  const absoluteCenter = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const parent = node.parentId ? (nodesById[node.parentId] as TBoxSceneNode | undefined) : undefined;

  if (parent) {
    const parentTransform = getSvgAncestorLocalTransform(parent, nodesById);
    const parentAbsoluteCenter = { x: parent.x + parent.width / 2, y: parent.y + parent.height / 2 };
    const unrotated = rotatePoint(absoluteCenter, parentAbsoluteCenter, -parent.rotation);

    return {
      localCenter: {
        x: unrotated.x + (parentTransform.localCenter.x - parentAbsoluteCenter.x),
        y: unrotated.y + (parentTransform.localCenter.y - parentAbsoluteCenter.y),
      },
      localRotation: node.rotation - parent.rotation,
    };
  }

  return { localCenter: absoluteCenter, localRotation: node.rotation };
};
