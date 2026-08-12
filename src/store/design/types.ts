// types
import { ToolName } from 'types/design/enums';
import { TEditingTextBox } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

export type TDesignState = {
  activeTool: ToolName;
  editingTextBox: TEditingTextBox | null;
  editingTextContent: string;
  lastMouseTool: ToolName;
  lastShapeTool: ToolName;
  nodes: Record<string, TSceneNode>;
  rootOrder: string[];
  selectedIds: string[];
  viewport: TViewport;
};
