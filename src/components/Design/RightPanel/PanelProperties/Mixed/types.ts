// types
import { NodeType } from 'types/design/enums';

export type TPanelNodeType = NodeType.boolean | NodeType.frame | NodeType.rectangle;

export type TPanelSection =
  'appearance' | 'cornerRadius' | 'effects' | 'export' | 'fill' | 'layout' | 'layoutGuide' | 'position' | 'selectionColors' | 'stroke';

export type TPanelHeaderButton = 'boolean' | 'component' | 'editObject' | 'mask' | 'matchingLayers' | 'wrapInSection';
