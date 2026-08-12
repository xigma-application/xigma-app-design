// store
import { RootState } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TEditingTextBox } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

export const selectActiveTool = (state: RootState): ToolName => state.design.activeTool;

export const selectEditingTextBox = (state: RootState): TEditingTextBox | null => state.design.editingTextBox;

export const selectEditingTextContent = (state: RootState): string => state.design.editingTextContent;

export const selectLastMouseTool = (state: RootState): ToolName => state.design.lastMouseTool;

export const selectLastShapeTool = (state: RootState): ToolName => state.design.lastShapeTool;

export const selectNodes = (state: RootState): Record<string, TSceneNode> => state.design.nodes;

export const selectOrderedNodes = (state: RootState): TSceneNode[] => state.design.rootOrder.map((id) => state.design.nodes[id]);

export const selectSelectedIds = (state: RootState): string[] => state.design.selectedIds;

export const selectSelectedNodes = (state: RootState): TSceneNode[] => state.design.selectedIds.map((id) => state.design.nodes[id]);

export const selectViewport = (state: RootState): TViewport => state.design.viewport;
