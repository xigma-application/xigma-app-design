// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { getSvgAncestorLocalTransform } from './getSvgAncestorLocalTransform';

export const getSvgLocalizedNode = <TNode extends TBoxSceneNode>(node: TNode, nodesById: Record<string, TSceneNode>): TNode => {
  const { localCenter, localRotation } = getSvgAncestorLocalTransform(node, nodesById);
  return { ...node, rotation: localRotation, x: localCenter.x - node.width / 2, y: localCenter.y - node.height / 2 };
};
