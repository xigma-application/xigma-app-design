// others
import { SECTION_CORNER_RADIUS } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSectionNode } from 'types/design/types';

// utils
import { getSolidPaintColor } from 'utils/design/paint/getSolidPaintColor';

export const convertFrameToSection = (node: TFrameNode): TSectionNode => ({
  childIds: node.childIds,
  cornerRadius: node.cornerRadius ?? SECTION_CORNER_RADIUS,
  fill: getSolidPaintColor(node.fills) ?? '',
  height: node.height,
  hidden: node.hidden,
  id: node.id,
  locked: node.locked,
  name: node.name,
  parentId: node.parentId,
  rotation: node.rotation,
  type: NodeType.section,
  width: node.width,
  x: node.x,
  y: node.y,
});
