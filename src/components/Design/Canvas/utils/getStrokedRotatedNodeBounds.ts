// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from './getRotatedNodeBounds';
import { getStrokePadding } from './getNodeAtPoint/getStrokePadding';

export const getStrokedRotatedNodeBounds = (node: TSceneNode): TDraftRect => {
  if (node.type === NodeType.line || node.type === NodeType.vector) {
    return getRotatedNodeBounds(node);
  }

  const padding = getStrokePadding(node);

  return getRotatedNodeBounds({
    ...node,
    height: node.height + padding * 2,
    width: node.width + padding * 2,
    x: node.x - padding,
    y: node.y - padding,
  });
};
