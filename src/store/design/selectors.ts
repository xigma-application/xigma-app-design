import { createSelector } from '@reduxjs/toolkit';

// store
import { RootState } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TDesignPage } from './types';
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TComment, TSceneNode, TViewport } from 'types/design/types';

export const selectActivePageId = (state: RootState): string => state.design.activePageId;

export const selectPages = (state: RootState): Record<string, TDesignPage> => state.design.pages;

export const selectActivePage = createSelector([selectActivePageId, selectPages], (activePageId, pages) => pages[activePageId]);

export const selectActiveTool = (state: RootState): ToolName => state.design.activeTool;

export const selectCommentDraftPosition = (state: RootState): TPoint | null => state.design.commentDraftPosition;

const selectCommentsRecord = createSelector([selectActivePage], (page): Record<string, TComment> => page.comments);

export const selectComments = createSelector([selectCommentsRecord], (comments) => Object.values(comments));

export const selectEditingNodeId = (state: RootState): string | null => state.design.editingNodeId;

export const selectEditingSelectionChangedAt = (state: RootState): number => state.design.editingSelectionChangedAt;

export const selectEditingSelectionEnd = (state: RootState): number => state.design.editingSelectionEnd;

export const selectEditingSelectionStart = (state: RootState): number => state.design.editingSelectionStart;

export const selectEditingTextBox = (state: RootState): TEditingTextBox | null => state.design.editingTextBox;

export const selectEditingTextContent = (state: RootState): string => state.design.editingTextContent;

export const selectIsUiMinimized = (state: RootState): boolean => state.design.isUiMinimized;

export const selectLastFrameTool = (state: RootState): ToolName => state.design.lastFrameTool;

export const selectLastMoreTool = (state: RootState): ToolName | null => state.design.lastMoreTool;

export const selectLastMouseTool = (state: RootState): ToolName => state.design.lastMouseTool;

export const selectLastPenTool = (state: RootState): ToolName => state.design.lastPenTool;

export const selectLastShapeTool = (state: RootState): ToolName => state.design.lastShapeTool;

export const selectLastTextTool = (state: RootState): ToolName => state.design.lastTextTool;

export const selectNodes = createSelector([selectActivePage], (page): Record<string, TSceneNode> => page.nodes);

export const selectPaintColor = createSelector([selectActivePage], (page): string => page.paintColor);

export const selectPenActiveVertexId = (state: RootState): string | null => state.design.penActiveVertexId;

const selectRootOrder = createSelector([selectActivePage], (page): string[] => page.rootOrder);

export const selectOrderedNodes = createSelector([selectRootOrder, selectNodes], (rootOrder, nodes) => rootOrder.map((id) => nodes[id]));

export const selectSelectedIds = (state: RootState): string[] => state.design.selectedIds;

export const selectSelectedNodes = createSelector([selectSelectedIds, selectNodes], (selectedIds, nodes) =>
  selectedIds.map((id) => nodes[id]),
);

export const selectVectorEditingNodeIds = (state: RootState): string[] => state.design.vectorEditingNodeIds;

export const selectViewport = createSelector([selectActivePage], (page): TViewport => page.viewport);
