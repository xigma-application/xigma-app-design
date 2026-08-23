// types
import { ToolName } from 'types/design/enums';
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TComment, TSceneNode, TViewport } from 'types/design/types';

export type TDesignState = {
  activeTool: ToolName;
  commentDraftPosition: TPoint | null;
  comments: Record<string, TComment>;
  editingNodeId: string | null;
  editingSelectionChangedAt: number;
  editingSelectionEnd: number;
  editingSelectionStart: number;
  editingTextBox: TEditingTextBox | null;
  editingTextContent: string;
  lastFrameTool: ToolName;
  lastMoreTool: ToolName | null;
  lastMouseTool: ToolName;
  lastPenTool: ToolName;
  lastShapeTool: ToolName;
  lastTextTool: ToolName;
  nodes: Record<string, TSceneNode>;
  penActiveVertexId: string | null;
  rootOrder: string[];
  selectedIds: string[];
  vectorEditingNodeIds: string[];
  viewport: TViewport;
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
