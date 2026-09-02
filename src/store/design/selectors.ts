import { createSelector } from '@reduxjs/toolkit';

// store
import { RootState } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TDesignPage } from './types';
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TComment, TSceneNode, TViewport } from 'types/design/types';
import { TGuide, TGuideLine } from 'types/design/guides/types';

// utils
import { collectDescendantIdsOfSelected } from './utils/collectDescendantIdsOfSelected';
import { getAllGuideLines } from './utils/getAllGuideLines';
import { getFrameGuideLines } from './utils/getFrameGuideLines';
import { getRenderOrderedNodes } from './utils/getRenderOrderedNodes';
import { getTransformTargetNodes } from './utils/nodeHierarchy/getTransformTargetNodes';
import { resolveMaskConnectorRoles } from './utils/maskConnector/resolveMaskConnectorRoles';

// types
export type { TMaskConnectorInfo, TMaskConnectorLine, TMaskConnectorRole } from './types';

export const selectActivePageId = (state: RootState): string => state.design.activePageId;

export const selectPages = (state: RootState): Record<string, TDesignPage> => state.design.pages;

export const selectActivePage = createSelector([selectActivePageId, selectPages], (activePageId, pages) => pages[activePageId]);

export const selectActiveTool = (state: RootState): ToolName => state.design.activeTool;

export const selectAreRulersVisible = (state: RootState): boolean => state.design.areRulersVisible;

export const selectCommentDraftPosition = (state: RootState): TPoint | null => state.design.commentDraftPosition;

const selectCommentsRecord = createSelector([selectActivePage], (page): Record<string, TComment> => page.comments);

export const selectComments = createSelector([selectCommentsRecord], (comments) => Object.values(comments));

export const selectEditingNodeId = (state: RootState): string | null => state.design.editingNodeId;

export const selectEditingSelectionChangedAt = (state: RootState): number => state.design.editingSelectionChangedAt;

export const selectEditingSelectionEnd = (state: RootState): number => state.design.editingSelectionEnd;

export const selectEditingSelectionStart = (state: RootState): number => state.design.editingSelectionStart;

export const selectEditingTextBox = (state: RootState): TEditingTextBox | null => state.design.editingTextBox;

export const selectEditingTextContent = (state: RootState): string => state.design.editingTextContent;

export const selectIsActionsPanelOpen = (state: RootState): boolean => state.design.isActionsPanelOpen;

export const selectIsUiHidden = (state: RootState): boolean => state.design.isUiHidden;

export const selectIsUiMinimized = (state: RootState): boolean => state.design.isUiMinimized;

export const selectLastFrameTool = (state: RootState): ToolName => state.design.lastFrameTool;

export const selectLastMoreTool = (state: RootState): ToolName | null => state.design.lastMoreTool;

export const selectLastMouseTool = (state: RootState): ToolName => state.design.lastMouseTool;

export const selectLastPenTool = (state: RootState): ToolName => state.design.lastPenTool;

export const selectLastShapeTool = (state: RootState): ToolName => state.design.lastShapeTool;

export const selectLastTextTool = (state: RootState): ToolName => state.design.lastTextTool;

export const selectNodes = createSelector([selectActivePage], (page): Record<string, TSceneNode> => page.nodes);

export const selectPageGuides = createSelector([selectActivePage], (page): TGuide[] => page.guides);

export const selectFrameGuides = createSelector([selectNodes], (nodes): TGuideLine[] => getFrameGuideLines(nodes));

export const selectAllGuideLines = createSelector([selectPageGuides, selectFrameGuides], (pageGuides, frameGuides): TGuideLine[] =>
  getAllGuideLines(pageGuides, frameGuides),
);

export const selectPaintColor = createSelector([selectActivePage], (page): string => page.paintColor);

export const selectPenActiveVertexId = (state: RootState): string | null => state.design.penActiveVertexId;

const selectRootOrder = createSelector([selectActivePage], (page): string[] => page.rootOrder);

export const selectOrderedNodes = createSelector([selectRootOrder, selectNodes], (rootOrder, nodes) => rootOrder.map((id) => nodes[id]));

export const selectRenderOrderedNodes = createSelector([selectRootOrder, selectNodes], (rootOrder, nodes) =>
  getRenderOrderedNodes(rootOrder, nodes),
);

export const selectMaskConnectorRoleById = createSelector([selectNodes], (nodes) => resolveMaskConnectorRoles(nodes));

export const selectSelectedIds = createSelector([selectActivePage], (page): string[] => page.selectedIds);

export const selectSelectedNodes = createSelector([selectSelectedIds, selectNodes], (selectedIds, nodes) =>
  selectedIds.map((id) => nodes[id]),
);

export const selectSelectedLeafNodes = createSelector([selectSelectedNodes, selectNodes], (selectedNodes, nodes) =>
  getTransformTargetNodes(selectedNodes.filter(Boolean), nodes),
);

export const selectDescendantIdsOfSelected = createSelector([selectSelectedNodes, selectNodes], (selectedNodes, nodes) =>
  collectDescendantIdsOfSelected(selectedNodes, nodes),
);

export const selectVectorEditingNodeIds = (state: RootState): string[] => state.design.vectorEditingNodeIds;

export const selectViewport = createSelector([selectActivePage], (page): TViewport => page.viewport);
