// @xigma
import { TIconProps } from '@xigma/components';

// types
import { NodeType } from 'types/design/enums';

export const NODE_TYPE_ICON: Record<NodeType, TIconProps['name']> = {
  [NodeType.ellipse]: 'EllipseTool',
  [NodeType.frame]: 'FrameTool',
  [NodeType.line]: 'LineTool',
  [NodeType.media]: 'File',
  [NodeType.path]: 'PenTool',
  [NodeType.polygon]: 'PolygonTool',
  [NodeType.rectangle]: 'RectangleTool',
  [NodeType.section]: 'SectionTool',
  [NodeType.star]: 'StarTool',
  [NodeType.text]: 'TextTool',
  [NodeType.vector]: 'PenTool',
};
