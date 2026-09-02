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

export type TMaskConnectorRole = 'mask' | 'masked-continue' | 'masked-start';

export type TMaskConnectorLine = {
  depthOffset: number;
  role: TMaskConnectorRole;
};

// A single row can carry more than one connector line at once: its own role inside its own
// parent's mask scope (always depthOffset 0), *and* one passthrough line for every ancestor
// scope still open above it (depthOffset counts nesting levels below that ancestor's own
// column, so the line can be pulled back left by that many indent-widths and stay in the
// anchor's column instead of drifting right with each nested level). Both can be true at once
// — e.g. a row that is itself masked content of an outer group, while also being a plain
// descendant nested a few levels below that.
export type TMaskConnectorInfo = TMaskConnectorLine[];

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
  isActionsPanelOpen: boolean;
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

export type TMoveNodesPayload = {
  nodeIds: string[];
  targetIndex: number;
  targetParentId: string | null;
};

export type TMoveNodesToPagePayload = {
  nodeIds: string[];
  targetPageId: string;
};

export type TAddNodesPayload = {
  nodes: TSceneNode[];
  rootIds: string[];
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
