// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const canOutlineNodeStroke = (node: TSceneNode): boolean => {
  if (node.type !== NodeType.text) {
    const hasStrokeColor =
      node.type === NodeType.line || node.type === NodeType.vector
        ? node.strokes.length > 0
        : 'strokeColor' in node && Boolean(node.strokeColor);
    return 'strokeWidth' in node && Boolean(node.strokeWidth) && hasStrokeColor;
  }

  return true;
};
