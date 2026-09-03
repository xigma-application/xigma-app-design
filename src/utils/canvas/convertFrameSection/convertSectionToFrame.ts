// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSectionNode } from 'types/design/types';

export const convertSectionToFrame = (node: TSectionNode): TFrameNode => ({
  childIds: node.childIds,
  clipContent: true,
  fill: node.fill,
  height: node.height,
  hidden: node.hidden,
  id: node.id,
  isMask: node.isMask,
  locked: node.locked,
  name: node.name,
  parentId: node.parentId,
  rotation: node.rotation,
  type: NodeType.frame,
  width: node.width,
  x: node.x,
  y: node.y,
});
