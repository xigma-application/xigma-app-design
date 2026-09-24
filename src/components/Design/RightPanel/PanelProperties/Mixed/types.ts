// types
import { NodeType } from 'types/design/enums';

export type TPanelNodeType = NodeType.boolean | NodeType.frame | NodeType.group | NodeType.rectangle;

export type TPanelSection =
  'appearance' | 'cornerRadius' | 'effects' | 'export' | 'fill' | 'layout' | 'layoutGuide' | 'position' | 'selectionColors' | 'stroke';
