// types
import { NodeType } from 'types/design/enums';
import { TRotateNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

export const getRotateNodeOrigins = (selectedNodes: TSceneNode[]): Record<string, TRotateNodeOrigin> => {
  const nodeOrigins: Record<string, TRotateNodeOrigin> = {};

  selectedNodes.forEach((node) => {
    switch (node.type) {
      case NodeType.line:
        nodeOrigins[node.id] = { x1: node.x1, x2: node.x2, y1: node.y1, y2: node.y2 };
        break;
      case NodeType.vector:
        nodeOrigins[node.id] = { rotation: node.rotation, segments: node.segments, vertices: node.vertices };
        break;
      default:
        nodeOrigins[node.id] = { height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y };
    }
  });

  return nodeOrigins;
};
