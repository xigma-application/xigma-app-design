// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { getStrokePaddings } from 'utils/design/stroke/getStrokePaddings';

export const getStrokeExpandedNode = <T extends TBoxSceneNode>(node: T): T => {
  const { bottom, left, right, top } = getStrokePaddings(node);
  const padding = Math.max(bottom, left, right, top);

  if (padding > 0) {
    const expansion = {
      cornerRadius: ('cornerRadius' in node ? (node.cornerRadius ?? 0) : 0) + padding,
      height: node.height + top + bottom,
      width: node.width + left + right,
      x: node.x - left,
      y: node.y - top,
    };

    return { ...node, ...expansion };
  }

  return node;
};
