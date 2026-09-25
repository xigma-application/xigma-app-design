// types
import { NodeType } from 'types/design/enums';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getLinePoints } from 'utils/canvas/line/getLinePoints';
import { getVectorNodeOrigin } from '../../../../../utils/getVectorNodeOrigin';
import { isFlippableNode } from './isFlippableNode';

export const getResizeNodeOrigin = (node: TSceneNode): TResizeNodeOrigin => {
  switch (node.type) {
    case NodeType.line:
      return getLinePoints(node);
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
