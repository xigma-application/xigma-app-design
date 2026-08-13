// types
import { ToolName } from 'types/design/enums';
import { TEditingTextBox } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

export type TDesignState = {
  activeTool: ToolName;
  editingNodeId: string | null;
  editingTextBox: TEditingTextBox | null;
  editingTextContent: string;
  lastMouseTool: ToolName;
  lastShapeTool: ToolName;
  nodes: Record<string, TSceneNode>;
  rootOrder: string[];
  selectedIds: string[];
  viewport: TViewport;
};

export type TStartTextEditPayload = {
  box: TEditingTextBox;
  content?: string;
  id?: string | null;
};
