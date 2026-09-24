// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TPanelNodeType, TPanelSection } from './types';

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
