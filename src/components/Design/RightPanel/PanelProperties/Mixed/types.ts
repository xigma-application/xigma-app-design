// types
import { NodeType } from 'types/design/enums';

export type TPanelNodeType =
  | NodeType.boolean
  | NodeType.ellipse
  | NodeType.frame
  | NodeType.group
  | NodeType.line
  | NodeType.polygon
  | NodeType.rectangle
  | NodeType.section
  | NodeType.slice
  | NodeType.star
  | NodeType.vector;

export type TPanelSection =
  | 'appearance'
  | 'cornerRadius'
  | 'effects'
  | 'export'
  | 'fill'
  | 'layout'
  | 'layoutGuide'
  | 'position'
  | 'rotation'
  | 'selectionColors'
  | 'stroke';
