// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSectionNode } from 'types/design/types';

// utils
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const convertSectionToFrame = (node: TSectionNode): TFrameNode => ({
  childIds: node.childIds,
  clipContent: true,
  cornerRadius: node.cornerRadius,
  fills: [makeSolidPaint(node.fill)],
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
