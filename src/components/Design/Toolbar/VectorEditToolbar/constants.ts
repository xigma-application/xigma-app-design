// assets
import { Icons } from 'assets/svg';

// others
import { translationNameSpace as toolbarNamespace } from '../constants';

// types
import { ToolName } from 'types/design/enums';

export const translationNameSpace = `${toolbarNamespace}.vectorEditToolbar`;

export const ICON_SIZE = 24;

export type TVectorEditTool = {
  icon: keyof typeof Icons;
  labelKey: string;
  toolName?: ToolName;
};

export const TOOLS: TVectorEditTool[] = [
  { icon: 'MoveVectorTool', labelKey: 'design.toolbar.tool.default', toolName: ToolName.default },
  { icon: 'LassoTool', labelKey: `${translationNameSpace}.tool.lasso` },
  { icon: 'PaintTool', labelKey: `${translationNameSpace}.tool.paint` },
  { icon: 'BendTool', labelKey: `${translationNameSpace}.tool.bend` },
  { icon: 'CutTool', labelKey: `${translationNameSpace}.tool.cut` },
];
