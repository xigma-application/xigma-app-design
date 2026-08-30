// types
import { NodeType } from 'types/design/enums';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorNodeOrigin } from '../../../../../utils/getVectorNodeOrigin';
import { isFlippableNode } from './isFlippableNode';

export const getResizeNodeOrigin = (node: TSceneNode): TResizeNodeOrigin => {
  switch (node.type) {
    case NodeType.line:
      return { x1: node.x1, x2: node.x2, y1: node.y1, y2: node.y2 };
    case NodeType.vector:
      return { ...getVectorNodeOrigin(node), rotation: node.rotation };
    default:
      return {
        flip: isFlippableNode(node) ? { x: node.flipX ?? false, y: node.flipY ?? false } : null,
        height: node.height,
        rotation: node.rotation,
        width: node.width,
        x: node.x,
        y: node.y,
      };
  }
};
