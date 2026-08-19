// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const getNodeBounds = (node: TSceneNode): TDraftRect => {
  switch (node.type) {
    case NodeType.line: {
      const x = Math.min(node.x1, node.x2);
      const y = Math.min(node.y1, node.y2);

      return { height: Math.abs(node.y2 - node.y1), width: Math.abs(node.x2 - node.x1), x, y };
    }
    case NodeType.vector:
      return getVectorNodeBounds(node);
    default:
      return { height: node.height, width: node.width, x: node.x, y: node.y };
  }
};
