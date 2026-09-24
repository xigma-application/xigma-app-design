// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

export const convertGroupToFrame = (node: TGroupNode): TFrameNode => ({
  childIds: node.childIds,
  clipContent: false,
  fills: [],
  height: node.height,
  hidden: node.hidden,
  id: node.id,
  locked: node.locked,
  name: node.name,
  parentId: node.parentId,
  rotation: node.rotation,
  type: NodeType.frame,
  width: node.width,
  x: node.x,
  y: node.y,
});
