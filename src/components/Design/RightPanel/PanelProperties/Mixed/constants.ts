// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TPanelNodeType, TPanelSection } from './types';

export const translationNameSpace = `${parentNameSpace}.mixed`;

export const PANEL_SECTIONS: Record<TPanelNodeType, TPanelSection[]> = {
  [NodeType.boolean]: ['position', 'rotation', 'layout', 'appearance', 'fill', 'stroke', 'effects', 'export'],
  [NodeType.ellipse]: ['position', 'rotation', 'layout', 'appearance', 'fill', 'stroke', 'effects', 'export'],
  [NodeType.frame]: [
    'position',
    'rotation',
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
  [NodeType.group]: [
    'position',
    'rotation',
    'layout',
    'appearance',
    'cornerRadius',
    'fill',
    'stroke',
    'effects',
    'selectionColors',
    'export',
  ],
  [NodeType.line]: ['position', 'rotation', 'layout', 'appearance', 'stroke', 'effects', 'export'],
  [NodeType.polygon]: ['position', 'rotation', 'layout', 'appearance', 'fill', 'stroke', 'effects', 'export'],
  [NodeType.rectangle]: ['position', 'rotation', 'layout', 'appearance', 'cornerRadius', 'fill', 'stroke', 'effects', 'export'],
  [NodeType.section]: ['position', 'layout', 'appearance', 'cornerRadius', 'fill', 'stroke', 'selectionColors', 'export'],
  [NodeType.slice]: ['position', 'rotation', 'layout', 'export'],
  [NodeType.star]: ['position', 'rotation', 'layout', 'appearance', 'fill', 'stroke', 'effects', 'export'],
};

export const CHILD_PANEL_SECTIONS: TPanelSection[] = ['appearance', 'cornerRadius', 'fill', 'stroke', 'effects'];
