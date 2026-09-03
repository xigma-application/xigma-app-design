// types
import { TDraftRect, TEditingTextBox, TPoint, TResizeHandle } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TCanvasRefs, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

export type THoverResult = {
  className: string | null;
  cursor: string;
  nodeId: string | null;
};

export type THoverResolverContext = {
  activeTool: ToolName;
  editingContent: string;
  editingNodeId: string | null;
  editingTextBox: TEditingTextBox | null;
  isControlPressed: boolean;
  leafNodes: TSceneNode[];
  nodesById: Record<string, TSceneNode>;
  point: TPoint;
  refs: TCanvasRefs;
  resizableSelectedNodes: TSceneNode[];
  resizeHandleHit: { bounds: TDraftRect; handle: TResizeHandle; rotation: number } | null;
  selectedNodes: TSceneNode[];
  vectorMultiSelectBox: TVectorMultiSelectBox | null;
  vectorMultiSelectResizeHandle: TResizeHandle | null;
  viewport: TViewport;
};
