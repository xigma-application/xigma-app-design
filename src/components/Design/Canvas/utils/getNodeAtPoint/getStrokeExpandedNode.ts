// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { getStrokePadding } from './getStrokePadding';

export const getStrokeExpandedNode = <T extends TBoxSceneNode>(node: T): T => {
  const padding = getStrokePadding(node);

  if (padding > 0) {
    const expansion = {
      cornerRadius: ('cornerRadius' in node ? (node.cornerRadius ?? 0) : 0) + padding,
      height: node.height + padding * 2,
      width: node.width + padding * 2,
      x: node.x - padding,
      y: node.y - padding,
    };

    return { ...node, ...expansion };
  }

  return node;
};
