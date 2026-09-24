// others
import { PANEL_SECTIONS } from '../constants';

// types
import { TPanelNodeType } from '../types';

export const isPanelNodeType = (type: string): type is TPanelNodeType => type in PANEL_SECTIONS;
