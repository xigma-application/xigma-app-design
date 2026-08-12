// assets
import { Icons } from 'assets/svg';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { ToolName } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.toolbar`;

export const TOOL_ICON: Record<ToolName, keyof typeof Icons> = {
  [ToolName.default]: 'MoveTool',
  [ToolName.ellipse]: 'EllipseTool',
  [ToolName.frame]: 'FrameTool',
  [ToolName.hand]: 'HandTool',
  [ToolName.line]: 'LineTool',
  [ToolName.media]: 'FileTool',
  [ToolName.polygon]: 'PolygonTool',
  [ToolName.rectangle]: 'RectangleTool',
  [ToolName.star]: 'StarTool',
  [ToolName.text]: 'TextTool',
  [ToolName.comment]: 'Comment',
};

export const TOOL_LABEL: Record<ToolName, string> = {
  [ToolName.comment]: `${translationNameSpace}.tool.comment`,
  [ToolName.default]: `${translationNameSpace}.tool.default`,
  [ToolName.ellipse]: `${translationNameSpace}.tool.ellipse`,
  [ToolName.frame]: `${translationNameSpace}.tool.frame`,
  [ToolName.hand]: `${translationNameSpace}.tool.hand`,
  [ToolName.line]: `${translationNameSpace}.tool.line`,
  [ToolName.media]: `${translationNameSpace}.tool.media`,
  [ToolName.polygon]: `${translationNameSpace}.tool.polygon`,
  [ToolName.rectangle]: `${translationNameSpace}.tool.rectangle`,
  [ToolName.star]: `${translationNameSpace}.tool.star`,
  [ToolName.text]: `${translationNameSpace}.tool.text`,
};

export const TOOL_GROUP_ITEMS: Partial<Record<ToolName, ToolName[]>> = {
  [ToolName.default]: [ToolName.default, ToolName.hand],
  [ToolName.rectangle]: [ToolName.rectangle, ToolName.line, ToolName.ellipse, ToolName.polygon, ToolName.star, ToolName.media],
};

export const TOOL_ICON_SIZE: Partial<Record<ToolName, number>> = {
  [ToolName.line]: 14,
};

export const TOOLS_WITH_DROPDOWN: ToolName[] = [ToolName.default, ToolName.frame, ToolName.rectangle];
export const TOOLBAR_ORDER: ToolName[] = [ToolName.default, ToolName.frame, ToolName.rectangle, ToolName.text, ToolName.comment];
