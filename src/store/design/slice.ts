import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

// others
import {
  DEFAULT_FRAME_TOOL,
  DEFAULT_MOUSE_TOOL,
  DEFAULT_PAGE_NAME,
  DEFAULT_PAINT_COLOR,
  DEFAULT_PEN_TOOL,
  DEFAULT_SHAPE_TOOL,
  DEFAULT_TEXT_TOOL,
  DEFAULT_TOOL,
  DEFAULT_VIEWPORT,
} from './constants';

// types
import {
  TAddNodesPayload,
  TDesignSnapshot,
  TDesignState,
  TMoveNodesPayload,
  TMoveNodesToPagePayload,
  TReorderPayload,
  TStartTextEditPayload,
  TTextEditSelection,
} from './types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TNewSceneNode, TSceneNode, TSceneNodeChanges, TViewport } from 'types/design/types';

// utils
import { getActivePage } from './utils/getActivePage';
import { handleAddComment } from './utils/handleAddComment';
import { handleAddNode } from './utils/handleAddNode';
import { handleAddNodes } from './utils/handleAddNodes';
import { handleAddPage } from './utils/handleAddPage';
import { handleBringSelectionToFront } from './utils/handleBringSelectionToFront';
import { handleDeleteNode } from './utils/handleDeleteNode/handleDeleteNode';
import { handleDeletePage } from './utils/handleDeletePage';
import { handleDuplicatePage, TDuplicatePagePayload } from './utils/handleDuplicatePage';
import { handleGroupNodes } from './utils/handleGroupNodes/handleGroupNodes';
import { handleMoveNodes } from './utils/handleMoveNodes/handleMoveNodes';
import { handleMoveNodesToPage } from './utils/handleMoveNodesToPage/handleMoveNodesToPage';
import { handleReorderPages } from './utils/handleReorderPages';
import { handleReplaceDesignSnapshot } from './utils/handleReplaceDesignSnapshot';
import { handleReplaceNode } from './utils/handleReplaceNode';
import { handleSendSelectionToBack } from './utils/handleSendSelectionToBack';
import { handleSetActiveTool } from './utils/handleSetActiveTool';
import { handleSetSelection } from './utils/handleSetSelection/handleSetSelection';
import { handleSetVectorEditingNodeIds } from './utils/handleSetVectorEditingNodeIds';
import { handleSetViewport } from './utils/handleSetViewport';
import { handleStartTextEdit } from './utils/handleStartTextEdit';
import { handleStopTextEdit } from './utils/handleStopTextEdit';
import { handleToggleNodeHidden } from './utils/handleToggleNodeHidden';
import { handleToggleNodeLocked } from './utils/handleToggleNodeLocked';
import { handleUngroupNodes } from './utils/handleUngroupNodes/handleUngroupNodes';
import { handleUpdateCommentContent } from './utils/handleUpdateCommentContent';
import { handleUpdateEditingTextBoxPathStartOffset } from './utils/handleUpdateEditingTextBoxPathStartOffset';
import { handleUpdateNode } from './utils/handleUpdateNode';
import { handleUpdateTextEditContent } from './utils/handleUpdateTextEditContent';
import { handleUpdateTextEditSelection } from './utils/handleUpdateTextEditSelection';

const initialPageId = nanoid();

const initialState: TDesignState = {
  activePageId: initialPageId,
  activeTool: DEFAULT_TOOL,
  commentDraftPosition: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isUiMinimized: false,
  lastFrameTool: DEFAULT_FRAME_TOOL,
  lastMoreTool: null,
  lastMouseTool: DEFAULT_MOUSE_TOOL,
  lastPenTool: DEFAULT_PEN_TOOL,
  lastShapeTool: DEFAULT_SHAPE_TOOL,
  lastTextTool: DEFAULT_TEXT_TOOL,
  pages: {
    [initialPageId]: {
      comments: {},
      id: initialPageId,
      name: DEFAULT_PAGE_NAME,
      nodes: {},
      paintColor: DEFAULT_PAINT_COLOR,
      rootOrder: [],
      selectedIds: [],
      viewport: DEFAULT_VIEWPORT,
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
};

const designSlice = createSlice({
  initialState,
  name: 'design',
  reducers: {
    addComment: {
      prepare: (content: string) => ({ payload: { content, id: nanoid() } }),
      reducer: (state, action: PayloadAction<{ content: string; id: string }>) => handleAddComment(state, action.payload),
    },
    addNode: {
      prepare: (node: TNewSceneNode) => ({ payload: { ...node, id: nanoid() } as TSceneNode }),
      reducer: (state, action: PayloadAction<TSceneNode>) => handleAddNode(state, action.payload),
    },
    addNodes: (state, action: PayloadAction<TAddNodesPayload>) => handleAddNodes(state, action.payload),
    addPage: {
      prepare: () => ({ payload: { id: nanoid() } }),
      reducer: (state, action: PayloadAction<{ id: string }>) => handleAddPage(state, action.payload.id),
    },
    bringSelectionToFront: (state) => handleBringSelectionToFront(state),
    cancelCommentDraft: (state) => {
      state.commentDraftPosition = null;
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      delete getActivePage(state).comments[action.payload];
    },
    deleteNode: (state, action: PayloadAction<string>) => handleDeleteNode(state, action.payload),
    deletePage: (state, action: PayloadAction<string>) => handleDeletePage(state, action.payload),
    duplicatePage: (state, action: PayloadAction<TDuplicatePagePayload>) => handleDuplicatePage(state, action.payload),
    groupNodes: {
      prepare: () => ({ payload: { groupId: nanoid() } }),
      reducer: (state, action: PayloadAction<{ groupId: string }>) => handleGroupNodes(state, action.payload.groupId),
    },
    moveNodes: (state, action: PayloadAction<TMoveNodesPayload>) => handleMoveNodes(state, action.payload),
    moveNodesToPage: (state, action: PayloadAction<TMoveNodesToPagePayload>) => handleMoveNodesToPage(state, action.payload),
    renamePage: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.pages[action.payload.id].name = action.payload.name;
    },
    reorderPages: (state, action: PayloadAction<TReorderPayload>) => handleReorderPages(state, action.payload),
    replaceDesignSnapshot: (state, action: PayloadAction<TDesignSnapshot>) => handleReplaceDesignSnapshot(state, action.payload),
    replaceNode: (state, action: PayloadAction<{ id: string; node: TSceneNode }>) => handleReplaceNode(state, action.payload),
    sendSelectionToBack: (state) => handleSendSelectionToBack(state),
    setActivePage: (state, action: PayloadAction<string>) => {
      state.activePageId = action.payload;
    },
    setActiveTool: (state, action: PayloadAction<ToolName>) => handleSetActiveTool(state, action.payload),
    setPaintColor: (state, action: PayloadAction<string>) => {
      getActivePage(state).paintColor = action.payload;
    },
    setPenActiveVertexId: (state, action: PayloadAction<string | null>) => {
      state.penActiveVertexId = action.payload;
    },
    setSelection: (state, action: PayloadAction<string[]>) => handleSetSelection(state, action.payload),
    setVectorEditingNodeIds: (state, action: PayloadAction<string[]>) => handleSetVectorEditingNodeIds(state, action.payload),
    setViewport: (state, action: PayloadAction<TViewport>) => handleSetViewport(state, action.payload),
    startCommentDraft: (state, action: PayloadAction<TPoint>) => {
      state.commentDraftPosition = action.payload;
    },
    startTextEdit: (state, action: PayloadAction<TStartTextEditPayload>) => handleStartTextEdit(state, action.payload),
    stopTextEdit: (state) => handleStopTextEdit(state),
    toggleNodeHidden: (state, action: PayloadAction<string>) => handleToggleNodeHidden(state, action.payload),
    toggleNodeLocked: (state, action: PayloadAction<string>) => handleToggleNodeLocked(state, action.payload),
    toggleUiMinimized: (state) => {
      state.isUiMinimized = !state.isUiMinimized;
    },
    ungroupNodes: (state, action: PayloadAction<string[]>) => handleUngroupNodes(state, action.payload),
    updateCommentContent: (state, action: PayloadAction<{ content: string; id: string }>) =>
      handleUpdateCommentContent(state, action.payload),
    updateEditingTextBoxPathStartOffset: (state, action: PayloadAction<number>) =>
      handleUpdateEditingTextBoxPathStartOffset(state, action.payload),
    updateNode: (state, action: PayloadAction<{ changes: TSceneNodeChanges; id: string }>) => handleUpdateNode(state, action.payload),
    updateTextEditContent: (state, action: PayloadAction<string>) => handleUpdateTextEditContent(state, action.payload),
    updateTextEditSelection: (state, action: PayloadAction<TTextEditSelection>) => handleUpdateTextEditSelection(state, action.payload),
  },
});

export const {
  addComment,
  addNode,
  addNodes,
  addPage,
  bringSelectionToFront,
  cancelCommentDraft,
  deleteComment,
  deleteNode,
  deletePage,
  duplicatePage,
  groupNodes,
  moveNodes,
  moveNodesToPage,
  renamePage,
  reorderPages,
  replaceDesignSnapshot,
  replaceNode,
  sendSelectionToBack,
  setActivePage,
  setActiveTool,
  setPaintColor,
  setPenActiveVertexId,
  setSelection,
  setVectorEditingNodeIds,
  setViewport,
  startCommentDraft,
  startTextEdit,
  stopTextEdit,
  toggleNodeHidden,
  toggleNodeLocked,
  toggleUiMinimized,
  ungroupNodes,
  updateCommentContent,
  updateEditingTextBoxPathStartOffset,
  updateNode,
  updateTextEditContent,
  updateTextEditSelection,
} = designSlice.actions;

export default designSlice.reducer;
