// assets
import { Icons } from 'assets/svg';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { ToolName } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.toolbar`;

export const TOOL_ICON: Record<ToolName, keyof typeof Icons> = {
  [ToolName.arrow]: 'ArrowTool',
  [ToolName.bend]: 'BendTool',
  [ToolName.cut]: 'CutTool',
  [ToolName.default]: 'MoveTool',
  [ToolName.ellipse]: 'EllipseTool',
  [ToolName.frame]: 'FrameTool',
  [ToolName.hand]: 'HandTool',
  [ToolName.lasso]: 'LassoTool',
  [ToolName.line]: 'LineTool',
  [ToolName.media]: 'FileTool',
  [ToolName.move]: 'MoveVectorTool',
  [ToolName.paint]: 'PaintTool',
  [ToolName.pen]: 'PenTool',
  [ToolName.pencil]: 'PencilTool',
  [ToolName.polygon]: 'PolygonTool',
  [ToolName.rectangle]: 'RectangleTool',
  [ToolName.scale]: 'ScaleTool',
  [ToolName.section]: 'SectionTool',
  [ToolName.shapeBuilder]: 'ShapeBuilderTool',
  [ToolName.slice]: 'SliceTool',
  [ToolName.star]: 'StarTool',
  [ToolName.text]: 'TextTool',
  [ToolName.textOnPath]: 'TextOnPathTool',
  [ToolName.variableWidth]: 'VariableWidthTool',
  [ToolName.comment]: 'CommentTool',
};

export const TOOL_LABEL: Record<ToolName, string> = {
  [ToolName.arrow]: `${translationNameSpace}.tool.arrow`,
  [ToolName.bend]: 'design.toolbar.vectorEditToolbar.tool.bend',
  [ToolName.comment]: `${translationNameSpace}.tool.comment`,
  [ToolName.cut]: 'design.toolbar.vectorEditToolbar.tool.cut',
  [ToolName.default]: `${translationNameSpace}.tool.default`,
  [ToolName.ellipse]: `${translationNameSpace}.tool.ellipse`,
  [ToolName.frame]: `${translationNameSpace}.tool.frame`,
  [ToolName.hand]: `${translationNameSpace}.tool.hand`,
  [ToolName.lasso]: 'design.toolbar.vectorEditToolbar.tool.lasso',
  [ToolName.line]: `${translationNameSpace}.tool.line`,
  [ToolName.media]: `${translationNameSpace}.tool.media`,
  [ToolName.move]: 'design.toolbar.tool.default',
  [ToolName.paint]: 'design.toolbar.vectorEditToolbar.tool.paint',
  [ToolName.pen]: `${translationNameSpace}.tool.pen`,
  [ToolName.pencil]: `${translationNameSpace}.tool.pencil`,
  [ToolName.polygon]: `${translationNameSpace}.tool.polygon`,
  [ToolName.rectangle]: `${translationNameSpace}.tool.rectangle`,
  [ToolName.scale]: `${translationNameSpace}.tool.scale`,
  [ToolName.section]: `${translationNameSpace}.tool.section`,
  [ToolName.shapeBuilder]: 'design.toolbar.vectorEditToolbar.tool.shapeBuilder',
  [ToolName.slice]: `${translationNameSpace}.tool.slice`,
  [ToolName.star]: `${translationNameSpace}.tool.star`,
  [ToolName.text]: `${translationNameSpace}.tool.text`,
  [ToolName.textOnPath]: `${translationNameSpace}.tool.textOnPath`,
  [ToolName.variableWidth]: 'design.toolbar.vectorEditToolbar.tool.variableWidth',
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
  [ToolName.pen]: [ToolName.pen, ToolName.pencil],
};

export const TOOL_ICON_SIZE: Partial<Record<ToolName, number>> = {
  [ToolName.default]: 24,
  [ToolName.comment]: 17,
  [ToolName.pen]: 24,
  [ToolName.pencil]: 24,
  [ToolName.polygon]: 17,
  [ToolName.slice]: 18,
  [ToolName.star]: 20,
};

export const TOOL_DROPDOWN_ICON_SIZE: Partial<Record<ToolName, number>> = {
  [ToolName.pen]: 21,
  [ToolName.pencil]: 21,
};

export const TOOLS_WITH_DROPDOWN: ToolName[] = [ToolName.default, ToolName.frame, ToolName.rectangle, ToolName.text, ToolName.pen];
export const TOOLBAR_ORDER: ToolName[] = [
  ToolName.default,
  ToolName.frame,
  ToolName.rectangle,
  ToolName.pen,
  ToolName.text,
  ToolName.comment,
];
