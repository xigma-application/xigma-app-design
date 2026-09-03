// types
import { ToolName } from 'types/design/enums';
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TComment, TSceneNode, TViewport } from 'types/design/types';
import { TGuide, TGuideAxis } from 'types/design/guides/types';
import { TSolidPaint } from 'types/design/paint/types';

export type TDesignPage = {
  comments: Record<string, TComment>;
  guides: TGuide[];
  id: string;
  name: string;
  nodes: Record<string, TSceneNode>;
  paint: TSolidPaint;
  rootOrder: string[];
  selectedIds: string[];
  viewport: TViewport;
};

export type TMaskConnectorRole = 'mask' | 'masked-continue' | 'masked-start';

export type TMaskConnectorLine = {
  depthOffset: number;
  role: TMaskConnectorRole;
};

export type TMaskConnectorInfo = TMaskConnectorLine[];

export type TDesignState = {
  activePageId: string;
  activeTool: ToolName;
  areAdditionalLabelsVisible: boolean;
  areRulersVisible: boolean;
  commentDraftPosition: TPoint | null;
  editingNodeId: string | null;
  editingSelectionChangedAt: number;
  editingSelectionEnd: number;
  editingSelectionStart: number;
  editingTextBox: TEditingTextBox | null;
  editingTextContent: string;
  isActionsPanelOpen: boolean;
  isUiHidden: boolean;
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

export type TAddGuidePayload = {
  axis: TGuideAxis;
  frameId: string | null;
  id: string;
  position: number;
};

export type TUpdateGuidePayload = {
  frameId: string | null;
  id: string;
  position: number;
};

export type TDeleteGuidePayload = {
  frameId: string | null;
  id: string;
};

export type TDeleteAllGuidesPayload = {
  axis: TGuideAxis;
};
