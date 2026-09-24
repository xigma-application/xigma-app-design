// others
import { SECTION_FILL } from 'components/Design/Canvas/constants';

// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TSectionNode } from 'types/design/types';

export const convertGroupToSection = (node: TGroupNode): TSectionNode => ({
  childIds: node.childIds,
  fill: SECTION_FILL,
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
