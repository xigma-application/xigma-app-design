// others
import { CONTROL, SHIFT } from 'constant/mainKeys';

// types
import { TKeyboardShortcuts } from './types';
import { ToolName } from 'types/design/enums';

export const KEYBOARD_SHORTCUTS: TKeyboardShortcuts = {
  [ToolName.arrow]: [SHIFT, 'L'],
  [ToolName.comment]: ['C'],
  [ToolName.default]: ['V'],
  [ToolName.ellipse]: ['O'],
  [ToolName.frame]: ['F'],
  [ToolName.hand]: ['H'],
  [ToolName.lasso]: ['Q'],
  [ToolName.line]: ['L'],
  [ToolName.media]: [CONTROL, SHIFT, 'K'],
  [ToolName.paint]: [SHIFT, 'B'],
  [ToolName.pen]: ['P'],
  [ToolName.pencil]: [SHIFT, 'P'],
  [ToolName.polygon]: [],
  [ToolName.rectangle]: ['R'],
  [ToolName.scale]: ['K'],
  [ToolName.section]: [SHIFT, 'S'],
  [ToolName.slice]: ['S'],
  [ToolName.star]: [],
  [ToolName.text]: ['T'],
  [ToolName.textOnPath]: [],
};
