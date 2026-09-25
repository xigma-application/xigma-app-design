// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TNewSceneNode } from 'types/design/types';

// utils
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const buildShapeNode = (
  rect: TDraftRect,
  fill: string,
  name: string,
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section,
  parentId: string | null,
): TNewSceneNode => {
  switch (type) {
    case NodeType.frame:
      return { ...rect, childIds: [], clipContent: true, fills: [makeSolidPaint(fill)], name, parentId, rotation: 0, type };
    case NodeType.section:
      return { ...rect, ...getDefaultSectionStyle(fill), childIds: [], name, parentId, rotation: 0, type };
    case NodeType.rectangle:
      return { ...rect, fills: [makeSolidPaint(fill)], name, parentId, rotation: 0, type };
    default:
      return { ...rect, fill, name, parentId, rotation: 0, type };
  }
};
