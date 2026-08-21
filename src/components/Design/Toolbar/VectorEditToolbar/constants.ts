// assets
import { Icons } from 'assets/svg';

// others
import { CONTROL, SHIFT } from 'constant/mainKeys';
import { translationNameSpace as toolbarNamespace } from '../constants';

// types
import { ToolName } from 'types/design/enums';

export const translationNameSpace = `${toolbarNamespace}.vectorEditToolbar`;

export const ICON_SIZE = 24;

export type TVectorEditTool = {
  icon: keyof typeof Icons;
  labelKey: string;
  shortcut?: Array<string>;
  toolName?: ToolName;
};

export const TOOLS: TVectorEditTool[] = [
  { icon: 'MoveVectorTool', labelKey: 'design.toolbar.tool.default', shortcut: ['V'], toolName: ToolName.move },
  { icon: 'LassoTool', labelKey: `${translationNameSpace}.tool.lasso`, shortcut: ['Q'], toolName: ToolName.lasso },
  { icon: 'PaintTool', labelKey: `${translationNameSpace}.tool.paint`, shortcut: [SHIFT, 'B'], toolName: ToolName.paint },
  { icon: 'BendTool', labelKey: `${translationNameSpace}.tool.bend`, shortcut: [CONTROL], toolName: ToolName.bend },
  { icon: 'CutTool', labelKey: `${translationNameSpace}.tool.cut`, shortcut: ['X'] },
];
