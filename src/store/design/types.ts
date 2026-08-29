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
  selectedIds: string[];
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
  vectorEditingNodeIds: string[];
};

export type TDesignSnapshot = {
  activePageId: string;
  pages: Record<string, TDesignPage>;
};

export type TReorderPayload = {
  fromIndex: number;
  toIndex: number;
};

export type TReorderNodesPayload = {
  fromIndices: number[];
  toIndex: number;
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
