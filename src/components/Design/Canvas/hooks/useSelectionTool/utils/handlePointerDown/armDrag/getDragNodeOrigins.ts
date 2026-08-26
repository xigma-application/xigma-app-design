// types
import { NodeType } from 'types/design/enums';
import { TNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorNodeOrigin } from 'components/Design/Canvas/utils/getVectorNodeOrigin';

export const getDragNodeOrigins = (armIds: string[], nodes: Record<string, TSceneNode>): Record<string, TNodeOrigin> =>
  Object.fromEntries(
    armIds.map((id) => {
      const node = nodes[id];

      switch (node.type) {
        case NodeType.line:
          return [id, { x1: node.x1, x2: node.x2, y1: node.y1, y2: node.y2 }];
        case NodeType.vector:
          return [id, getVectorNodeOrigin(node)];
        default:
          return [id, { x: node.x, y: node.y }];
      }
    }),
  );
