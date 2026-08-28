// types
import { ToolName } from 'types/design/enums';
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TComment, TSceneNode, TViewport } from 'types/design/types';

export type TDesignPage = {
  comments: Record<string, TComment>;
  id: string;
  name: string;
  nodes: Record<string, TSceneNode>;
  paintColor: string;
  rootOrder: string[];
  viewport: TViewport;
};

export type TDesignState = {
  activePageId: string;
  activeTool: ToolName;
  commentDraftPosition: TPoint | null;
  editingNodeId: string | null;
  editingSelectionChangedAt: number;
  editingSelectionEnd: number;
  editingSelectionStart: number;
  editingTextBox: TEditingTextBox | null;
  editingTextContent: string;
  isUiMinimized: boolean;
  lastFrameTool: ToolName;
  lastMoreTool: ToolName | null;
  lastMouseTool: ToolName;
  lastPenTool: ToolName;
  lastShapeTool: ToolName;
  lastTextTool: ToolName;
  pages: Record<string, TDesignPage>;
  penActiveVertexId: string | null;
  selectedIds: string[];
  vectorEditingNodeIds: string[];
};

export type TDesignSnapshot = {
  nodes: Record<string, TSceneNode>;
  rootOrder: string[];
  selectedIds: string[];
};

export type TStartTextEditPayload = {
  box: TEditingTextBox;
  content?: string;
  id?: string | null;
};

export type TTextEditSelection = {
  end: number;
  start: number;
};
