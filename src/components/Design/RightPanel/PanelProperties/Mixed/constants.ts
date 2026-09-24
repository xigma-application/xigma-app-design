// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TPanelHeaderButton, TPanelNodeType, TPanelSection } from './types';

export const translationNameSpace = `${parentNameSpace}.mixed`;

export const PANEL_SECTIONS: Record<TPanelNodeType, TPanelSection[]> = {
  [NodeType.boolean]: ['position', 'layout', 'appearance', 'fill', 'stroke', 'effects', 'export'],
  [NodeType.frame]: [
    'position',
    'layout',
    'appearance',
    'cornerRadius',
    'fill',
    'stroke',
    'effects',
    'selectionColors',
    'layoutGuide',
    'export',
  ],
  [NodeType.rectangle]: ['position', 'layout', 'appearance', 'cornerRadius', 'fill', 'stroke', 'effects', 'export'],
};

export const PANEL_HEADER_BUTTONS: Record<TPanelNodeType, TPanelHeaderButton[]> = {
  [NodeType.boolean]: ['component', 'mask', 'boolean'],
  [NodeType.frame]: ['matchingLayers', 'component', 'wrapInSection'],
  [NodeType.rectangle]: ['matchingLayers', 'component', 'mask', 'boolean', 'editObject'],
};
