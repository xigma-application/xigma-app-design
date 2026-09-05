import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

// others
import {
  DEFAULT_FRAME_TOOL,
  DEFAULT_MOUSE_TOOL,
  DEFAULT_PAGE_NAME,
  DEFAULT_PAINT,
  DEFAULT_PEN_TOOL,
  DEFAULT_SHAPE_TOOL,
  DEFAULT_TEXT_TOOL,
  DEFAULT_TOOL,
  DEFAULT_VECTOR_PAINT,
  DEFAULT_VIEWPORT,
} from './constants';

// types
import {
  TAddGuidePayload,
  TAddNodesPayload,
  TDeleteAllGuidesPayload,
  TDeleteGuidePayload,
  TDesignSnapshot,
  TDesignState,
  TMoveNodesPayload,
  TMoveNodesToPagePayload,
  TReorderPayload,
  TStartTextEditPayload,
  TTextEditSelection,
  TUpdateGuidePayload,
} from './types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSolidPaint } from 'types/design/paint/types';
import { TNewSceneNode, TSceneNode, TSceneNodeChanges, TViewport } from 'types/design/types';

// utils
import { getActivePage } from './utils/getActivePage';
import { handleAddComment } from './utils/handleAddComment';
import { handleAddGuide } from './utils/handleAddGuide';
import { handleAddNode } from './utils/handleAddNode';
import { handleAddNodes } from './utils/handleAddNodes';
import { handleAddPage } from './utils/handleAddPage';
import { handleBringSelectionToFront } from './utils/handleBringSelectionToFront';
import { handleDeleteAllGuides } from './utils/handleDeleteAllGuides';
import { handleDeleteGuide } from './utils/handleDeleteGuide';
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
import { handleToggleFrameClipContent } from './utils/handleToggleFrameClipContent/handleToggleFrameClipContent';
import { handleToggleNodeHidden } from './utils/handleToggleNodeHidden';
import { handleToggleNodeLocked } from './utils/handleToggleNodeLocked';
import { handleToggleNodeMask } from './utils/handleToggleNodeMask/handleToggleNodeMask';
import { handleUngroupNodes } from './utils/handleUngroupNodes/handleUngroupNodes';
import { handleUseNodesAsMask } from './utils/handleUseNodesAsMask/handleUseNodesAsMask';
import { handleUpdateCommentContent } from './utils/handleUpdateCommentContent';
import { handleUpdateEditingTextBoxPathStartOffset } from './utils/handleUpdateEditingTextBoxPathStartOffset';
import { handleUpdateGuide } from './utils/handleUpdateGuide';
import { handleUpdateNode } from './utils/handleUpdateNode/handleUpdateNode';
import { handleUpdateTextEditContent } from './utils/handleUpdateTextEditContent';
import { handleUpdateTextEditSelection } from './utils/handleUpdateTextEditSelection';

const initialPageId = nanoid();

const initialState: TDesignState = {
  activePageId: initialPageId,
  activeTool: DEFAULT_TOOL,
  commentDraftPosition: null,
  designHintLabelKey: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isActionsPanelOpen: false,
  isMediaToolArmed: false,
  isUiHidden: false,
  isUiMinimized: false,
  lastFrameTool: DEFAULT_FRAME_TOOL,
  lastMoreTool: null,
  lastMouseTool: DEFAULT_MOUSE_TOOL,
  lastPenTool: DEFAULT_PEN_TOOL,
  lastShapeTool: DEFAULT_SHAPE_TOOL,
  lastTextTool: DEFAULT_TEXT_TOOL,
  pages: {
    [initialPageId]: {
      backgroundPaint: DEFAULT_PAINT,
      comments: {},
      guides: [],
      id: initialPageId,
      name: DEFAULT_PAGE_NAME,
      nodes: {},
      paint: DEFAULT_VECTOR_PAINT,
      rootOrder: [],
      selectedIds: [],
      viewport: DEFAULT_VIEWPORT,
    },
  },
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
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
    addGuide: {
      prepare: (payload: Omit<TAddGuidePayload, 'id'>) => ({ payload: { ...payload, id: nanoid() } }),
      reducer: (state, action: PayloadAction<TAddGuidePayload>) => handleAddGuide(state, action.payload),
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
    createMaskGroup: {
      prepare: () => ({ payload: { groupId: nanoid() } }),
      reducer: (state, action: PayloadAction<{ groupId: string }>) => handleUseNodesAsMask(state, action.payload.groupId),
    },
    deleteAllGuides: (state, action: PayloadAction<TDeleteAllGuidesPayload>) => handleDeleteAllGuides(state, action.payload),
    deleteComment: (state, action: PayloadAction<string>) => {
      delete getActivePage(state).comments[action.payload];
    },
    deleteGuide: (state, action: PayloadAction<TDeleteGuidePayload>) => handleDeleteGuide(state, action.payload),
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
    setActionsPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isActionsPanelOpen = action.payload;
    },
    setActivePage: (state, action: PayloadAction<string>) => {
      state.activePageId = action.payload;
    },
    setActiveTool: (state, action: PayloadAction<ToolName>) => handleSetActiveTool(state, action.payload),
    setBackgroundPaint: (state, action: PayloadAction<TSolidPaint>) => {
      getActivePage(state).backgroundPaint = action.payload;
    },
    setDesignHintLabelKey: (state, action: PayloadAction<string | null>) => {
      state.designHintLabelKey = action.payload;
    },
    setMediaToolArmed: (state, action: PayloadAction<boolean>) => {
      state.isMediaToolArmed = action.payload;
    },
    setPaint: (state, action: PayloadAction<TSolidPaint>) => {
      getActivePage(state).paint = action.payload;
    },
    setPenActiveVertexId: (state, action: PayloadAction<string | null>) => {
      state.penActiveVertexId = action.payload;
    },
    setSelection: (state, action: PayloadAction<string[]>) => handleSetSelection(state, action.payload),
    setTemporaryActiveTool: (state, action: PayloadAction<ToolName>) => {
      state.activeTool = action.payload;
    },
    setVectorEditingNodeIds: (state, action: PayloadAction<string[]>) => handleSetVectorEditingNodeIds(state, action.payload),
    setViewport: (state, action: PayloadAction<TViewport>) => handleSetViewport(state, action.payload),
    startCommentDraft: (state, action: PayloadAction<TPoint>) => {
      state.commentDraftPosition = action.payload;
    },
    startTextEdit: (state, action: PayloadAction<TStartTextEditPayload>) => handleStartTextEdit(state, action.payload),
    stopTextEdit: (state) => handleStopTextEdit(state),
    toggleActionsPanelOpen: (state) => {
      state.isActionsPanelOpen = !state.isActionsPanelOpen;
    },
    toggleAdditionalLabels: (state) => {
      state.preferences.areAdditionalLabelsVisible = !state.preferences.areAdditionalLabelsVisible;
    },
    toggleFrameClipContent: (state, action: PayloadAction<string>) => handleToggleFrameClipContent(state, action.payload),
    toggleFrameOutlinesVisible: (state) => {
      state.preferences.areFrameOutlinesVisible = !state.preferences.areFrameOutlinesVisible;
    },
    toggleMaskOutlinesVisible: (state) => {
      state.preferences.areMaskOutlinesVisible = !state.preferences.areMaskOutlinesVisible;
    },
    toggleNodeHidden: (state, action: PayloadAction<string>) => handleToggleNodeHidden(state, action.payload),
    toggleNodeLocked: (state, action: PayloadAction<string>) => handleToggleNodeLocked(state, action.payload),
    toggleNodeMask: (state, action: PayloadAction<string>) => handleToggleNodeMask(state, action.payload),
    toggleRulers: (state) => {
      state.preferences.areRulersVisible = !state.preferences.areRulersVisible;
    },
    toggleUiHidden: (state) => {
      state.isUiHidden = !state.isUiHidden;
    },
    toggleUiMinimized: (state) => {
      state.isUiMinimized = !state.isUiMinimized;
    },
    ungroupNodes: (state, action: PayloadAction<string[]>) => handleUngroupNodes(state, action.payload),
    updateCommentContent: (state, action: PayloadAction<{ content: string; id: string }>) =>
      handleUpdateCommentContent(state, action.payload),
    updateEditingTextBoxPathStartOffset: (state, action: PayloadAction<number>) =>
      handleUpdateEditingTextBoxPathStartOffset(state, action.payload),
    updateGuide: (state, action: PayloadAction<TUpdateGuidePayload>) => handleUpdateGuide(state, action.payload),
    updateNode: (state, action: PayloadAction<{ changes: TSceneNodeChanges; id: string }>) => handleUpdateNode(state, action.payload),
    updateTextEditContent: (state, action: PayloadAction<string>) => handleUpdateTextEditContent(state, action.payload),
    updateTextEditSelection: (state, action: PayloadAction<TTextEditSelection>) => handleUpdateTextEditSelection(state, action.payload),
  },
});

export const {
  addComment,
  addGuide,
  addNode,
  addNodes,
  addPage,
  bringSelectionToFront,
  cancelCommentDraft,
  createMaskGroup,
  deleteAllGuides,
  deleteComment,
  deleteGuide,
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
  setActionsPanelOpen,
  setActivePage,
  setActiveTool,
  setBackgroundPaint,
  setDesignHintLabelKey,
  setMediaToolArmed,
  setPaint,
  setPenActiveVertexId,
  setSelection,
  setTemporaryActiveTool,
  setVectorEditingNodeIds,
  setViewport,
  startCommentDraft,
  startTextEdit,
  stopTextEdit,
  toggleActionsPanelOpen,
  toggleAdditionalLabels,
  toggleFrameClipContent,
  toggleFrameOutlinesVisible,
  toggleMaskOutlinesVisible,
  toggleNodeHidden,
  toggleNodeLocked,
  toggleNodeMask,
  toggleRulers,
  toggleUiHidden,
  toggleUiMinimized,
  ungroupNodes,
  updateCommentContent,
  updateEditingTextBoxPathStartOffset,
  updateGuide,
  updateNode,
  updateTextEditContent,
  updateTextEditSelection,
} = designSlice.actions;

export default designSlice.reducer;
