// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSectionNode } from 'types/design/types';

export const convertSectionToFrame = (node: TSectionNode): TFrameNode => ({
  childIds: node.childIds,
  clipContent: true,
  cornerRadius: node.cornerRadius,
  fills: node.fills,
  height: node.height,
  hidden: node.hidden,
  id: node.id,
  locked: node.locked,
  name: node.name,
  parentId: node.parentId,
  rotation: node.rotation,
  strokeAlign: node.strokeAlign,
  strokeWidth: node.strokeWidth,
  strokes: node.strokes,
  type: NodeType.frame,
  width: node.width,
  x: node.x,
  y: node.y,
});
