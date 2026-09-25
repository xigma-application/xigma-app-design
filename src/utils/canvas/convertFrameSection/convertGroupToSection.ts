// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TSectionNode } from 'types/design/types';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

export const convertGroupToSection = (node: TGroupNode): TSectionNode => ({
  ...getDefaultSectionStyle(),
  childIds: node.childIds,
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
