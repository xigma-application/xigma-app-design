import { createSelector } from '@reduxjs/toolkit';

// store
import { RootState } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TComment, TSceneNode, TViewport } from 'types/design/types';

export const selectActiveTool = (state: RootState): ToolName => state.design.activeTool;

export const selectCommentDraftPosition = (state: RootState): TPoint | null => state.design.commentDraftPosition;

const selectCommentsRecord = (state: RootState): Record<string, TComment> => state.design.comments;

export const selectComments = createSelector([selectCommentsRecord], (comments) => Object.values(comments));

export const selectEditingNodeId = (state: RootState): string | null => state.design.editingNodeId;

export const selectEditingSelectionChangedAt = (state: RootState): number => state.design.editingSelectionChangedAt;

export const selectEditingSelectionEnd = (state: RootState): number => state.design.editingSelectionEnd;

export const selectEditingSelectionStart = (state: RootState): number => state.design.editingSelectionStart;

export const selectEditingTextBox = (state: RootState): TEditingTextBox | null => state.design.editingTextBox;

export const selectEditingTextContent = (state: RootState): string => state.design.editingTextContent;

export const selectLastFrameTool = (state: RootState): ToolName => state.design.lastFrameTool;

export const selectLastMoreTool = (state: RootState): ToolName | null => state.design.lastMoreTool;

export const selectLastMouseTool = (state: RootState): ToolName => state.design.lastMouseTool;

export const selectLastPenTool = (state: RootState): ToolName => state.design.lastPenTool;

export const selectLastShapeTool = (state: RootState): ToolName => state.design.lastShapeTool;

export const selectLastTextTool = (state: RootState): ToolName => state.design.lastTextTool;

export const selectNodes = (state: RootState): Record<string, TSceneNode> => state.design.nodes;

export const selectPaintColor = (state: RootState): string => state.design.paintColor;

export const selectPenActiveVertexId = (state: RootState): string | null => state.design.penActiveVertexId;

const selectRootOrder = (state: RootState): string[] => state.design.rootOrder;

export const selectOrderedNodes = createSelector([selectRootOrder, selectNodes], (rootOrder, nodes) => rootOrder.map((id) => nodes[id]));

export const selectSelectedIds = (state: RootState): string[] => state.design.selectedIds;

export const selectSelectedNodes = createSelector([selectSelectedIds, selectNodes], (selectedIds, nodes) =>
  selectedIds.map((id) => nodes[id]),
);

export const selectVectorEditingNodeIds = (state: RootState): string[] => state.design.vectorEditingNodeIds;

export const selectViewport = (state: RootState): TViewport => state.design.viewport;
