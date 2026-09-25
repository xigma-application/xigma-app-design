// types
import { NodeType } from 'types/design/enums';

export type TPanelNodeType =
  | NodeType.boolean
  | NodeType.frame
  | NodeType.group
  | NodeType.line
  | NodeType.rectangle
  | NodeType.section
  | NodeType.slice;

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
