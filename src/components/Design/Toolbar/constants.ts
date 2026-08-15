// assets
import { Icons } from 'assets/svg';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { ToolName } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.toolbar`;

export const TOOL_ICON: Record<ToolName, keyof typeof Icons> = {
  [ToolName.arrow]: 'ArrowTool',
  [ToolName.default]: 'MoveTool',
  [ToolName.ellipse]: 'EllipseTool',
  [ToolName.frame]: 'FrameTool',
  [ToolName.hand]: 'HandTool',
  [ToolName.line]: 'LineTool',
  [ToolName.media]: 'FileTool',
  [ToolName.polygon]: 'PolygonTool',
  [ToolName.rectangle]: 'RectangleTool',
  [ToolName.scale]: 'ScaleTool',
  [ToolName.section]: 'SectionTool',
  [ToolName.slice]: 'SliceTool',
  [ToolName.star]: 'StarTool',
  [ToolName.text]: 'TextTool',
  [ToolName.textOnPath]: 'TextOnPathTool',
  [ToolName.comment]: 'Comment',
};

export const TOOL_LABEL: Record<ToolName, string> = {
  [ToolName.arrow]: `${translationNameSpace}.tool.arrow`,
  [ToolName.comment]: `${translationNameSpace}.tool.comment`,
  [ToolName.default]: `${translationNameSpace}.tool.default`,
  [ToolName.ellipse]: `${translationNameSpace}.tool.ellipse`,
  [ToolName.frame]: `${translationNameSpace}.tool.frame`,
  [ToolName.hand]: `${translationNameSpace}.tool.hand`,
  [ToolName.line]: `${translationNameSpace}.tool.line`,
  [ToolName.media]: `${translationNameSpace}.tool.media`,
  [ToolName.polygon]: `${translationNameSpace}.tool.polygon`,
  [ToolName.rectangle]: `${translationNameSpace}.tool.rectangle`,
  [ToolName.scale]: `${translationNameSpace}.tool.scale`,
  [ToolName.section]: `${translationNameSpace}.tool.section`,
  [ToolName.slice]: `${translationNameSpace}.tool.slice`,
  [ToolName.star]: `${translationNameSpace}.tool.star`,
  [ToolName.text]: `${translationNameSpace}.tool.text`,
  [ToolName.textOnPath]: `${translationNameSpace}.tool.textOnPath`,
};

export const TOOL_GROUP_ITEMS: Partial<Record<ToolName, ToolName[]>> = {
  [ToolName.default]: [ToolName.default, ToolName.hand, ToolName.scale],
  [ToolName.frame]: [ToolName.frame, ToolName.section, ToolName.slice],
  [ToolName.rectangle]: [
    ToolName.rectangle,
    ToolName.line,
    ToolName.arrow,
    ToolName.ellipse,
    ToolName.polygon,
    ToolName.star,
    ToolName.media,
  ],
  [ToolName.text]: [ToolName.text, ToolName.textOnPath],
};

export const TOOL_ICON_SIZE: Partial<Record<ToolName, number>> = {
  [ToolName.arrow]: 24,
  [ToolName.line]: 24,
  [ToolName.slice]: 18,
  [ToolName.textOnPath]: 18,
};

export const TOOLS_WITH_DROPDOWN: ToolName[] = [ToolName.default, ToolName.frame, ToolName.rectangle, ToolName.text];
export const TOOLBAR_ORDER: ToolName[] = [ToolName.default, ToolName.frame, ToolName.rectangle, ToolName.text, ToolName.comment];
