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
  TDimensionHintField,
  TGradientEditorState,
  TImageEditorState,
  TImageFillPickerFocus,
  TOpenPropertyPanel,
  TMoveNodesPayload,
  TMoveNodesToPagePayload,
  TPatternSourcePickTarget,
  TReorderPayload,
  TRevealedMinMax,
  TStartTextEditPayload,
  TTextEditSelection,
  TUpdateGuidePayload,
  TUpdateNodesPayload,
} from './types';
import { BlendMode, BooleanOperation, ToolName } from 'types/design/enums';
import { TAutoLayoutPaddingEditState, TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import {
  TGridSectionHighlight,
  TGridTrackModeMenuRequest,
  TGridTrackSelection,
  TGridTrackValueEditRequest,
} from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TPaint, TSolidPaint } from 'types/design/paint/types';
import { TNewSceneNode, TSceneNode, TSceneNodeChanges, TViewport } from 'types/design/types';

// utils
import { getActivePage } from './utils/getActivePage';
import { handleAddComment } from './utils/handleAddComment';
import { handleAddGuide } from './utils/handleAddGuide';
import { handleAddNode } from './utils/handleAddNode';
import { handleAddNodes } from './utils/handleAddNodes';
import { handleAddPage } from './utils/handleAddPage';
import { handleBooleanSelection } from './utils/handleBooleanNodes/handleBooleanSelection';
import { TBooleanNodesPayload } from './utils/handleBooleanNodes/handleBooleanNodes';
import { handleBringSelectionToFront } from './utils/handleBringSelectionToFront';
import { handleCloseOpenPropertyPanel } from './utils/handleCloseOpenPropertyPanel';
import { handleConvertGroupToBoolean } from './utils/handleBooleanNodes/handleConvertGroupToBoolean';
import { handleConvertGroupToMask } from './utils/handleUseNodesAsMask/handleConvertGroupToMask';
import { handleDeleteAllGuides } from './utils/handleDeleteAllGuides';
import { handleDeleteGuide } from './utils/handleDeleteGuide';
import { handleDeleteNode } from './utils/handleDeleteNode/handleDeleteNode';
import { handleDeletePage } from './utils/handleDeletePage';
import { handleDuplicatePage, TDuplicatePagePayload } from './utils/handleDuplicatePage';
import { handleGroupNodes } from './utils/handleGroupNodes/handleGroupNodes';
import { handleMoveNodes } from './utils/handleMoveNodes/handleMoveNodes';
import { handleMoveNodesToPage } from './utils/handleMoveNodesToPage/handleMoveNodesToPage';
import { handleRemoveNodeMask } from './utils/handleRemoveNodeMask/handleRemoveNodeMask';
import { handleReorderPages } from './utils/handleReorderPages';
import { handleReplaceDesignSnapshot } from './utils/handleReplaceDesignSnapshot';
import { handleReplaceNode } from './utils/handleReplaceNode';
import { handleSendSelectionToBack } from './utils/handleSendSelectionToBack';
import { handleSetActiveTool } from './utils/handleSetActiveTool';
import { handleSetGridSettingsPanelOpen } from './utils/handleSetGridSettingsPanelOpen';
import { handleSetImageEditor } from './utils/handleSetImageEditor';
import { handleSetSelection } from './utils/handleSetSelection/handleSetSelection';
import { handleSetVectorEditingNodeIds } from './utils/handleSetVectorEditingNodeIds';
import { handleSetViewport } from './utils/handleSetViewport';
import { handleStartTextEdit } from './utils/handleStartTextEdit';
import { handleStopAutoLayoutPaddingEdit } from './utils/handleStopAutoLayoutPaddingEdit';
import { handleStopTextEdit } from './utils/handleStopTextEdit';
import { handleToggleFrameClipContent } from './utils/handleToggleFrameClipContent/handleToggleFrameClipContent';
import { handleToggleNodeHidden } from './utils/handleToggleNodeHidden';
import { handleToggleNodeLocked } from './utils/handleToggleNodeLocked';
import { handleUngroupNodes } from './utils/handleUngroupNodes/handleUngroupNodes';
import { handleSelectionPerParent } from './utils/handleSelectionPerParent/handleSelectionPerParent';
import { handleUseNodesAsMask } from './utils/handleUseNodesAsMask/handleUseNodesAsMask';
import { handleWrapInSection } from './utils/handleWrapInSection/handleWrapInSection';
import { handleUpdateCommentContent } from './utils/handleUpdateCommentContent';
import { handleUpdateEditingTextBoxPathStartOffset } from './utils/handleUpdateEditingTextBoxPathStartOffset';
import { handleUpdateGuide } from './utils/handleUpdateGuide';
import { handleUpdateNode } from './utils/handleUpdateNode/handleUpdateNode';
import { handleUpdateNodes } from './utils/handleUpdateNodes/handleUpdateNodes';
import { handleUpdateTextEditContent } from './utils/handleUpdateTextEditContent';
import { handleUpdateTextEditSelection } from './utils/handleUpdateTextEditSelection';

const initialPageId = nanoid();

const initialState: TDesignState = {
  activePageId: initialPageId,
  activeTool: DEFAULT_TOOL,
  commentDraftPosition: null,
  designHintLabelKey: null,
  editingAutoLayoutPadding: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  gradientEditor: null,
  gridSectionHighlight: null,
  gridTrackModeMenuRequest: null,
  gridTrackSelection: null,
  gridTrackValueEditRequest: null,
  hoveredDimensionField: null,
  imageEditor: null,
  imageFillPickerFocus: null,
  isActionsPanelOpen: false,
  isExporting: false,
  isGridSettingsPanelOpen: false,
  isMediaToolArmed: false,
  isPatternSourcePicking: false,
  isUiHidden: false,
  isUiMinimized: false,
  lastFrameTool: DEFAULT_FRAME_TOOL,
  lastMoreTool: null,
  lastMouseTool: DEFAULT_MOUSE_TOOL,
  lastPenTool: DEFAULT_PEN_TOOL,
  lastShapeTool: DEFAULT_SHAPE_TOOL,
  lastTextTool: DEFAULT_TEXT_TOOL,
  openPropertyPanel: null,
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
      selectedFillIndices: [],
      selectedIds: [],
      viewport: DEFAULT_VIEWPORT,
    },
  },
  panelGridTrackSelection: null,
  patternSourcePickTarget: null,
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areLayoutGuidesVisible: true,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
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
      prepare: (node: TNewSceneNode, targetIndex?: number) => ({
        payload: { ...node, id: nanoid(), targetIndex } as TSceneNode & { targetIndex?: number },
      }),
      reducer: (state, action: PayloadAction<TSceneNode & { targetIndex?: number }>) => handleAddNode(state, action.payload),
    },
    addNodes: (state, action: PayloadAction<TAddNodesPayload>) => handleAddNodes(state, action.payload),
    addPage: {
      prepare: () => ({ payload: { id: nanoid() } }),
      reducer: (state, action: PayloadAction<{ id: string }>) => handleAddPage(state, action.payload.id),
    },
    booleanNodes: {
      prepare: (operation: BooleanOperation) => ({ payload: { groupId: nanoid(), operation } }),
      reducer: (state, action: PayloadAction<TBooleanNodesPayload>) => handleBooleanSelection(state, action.payload),
    },
    bringSelectionToFront: (state) => handleBringSelectionToFront(state),
    cancelCommentDraft: (state) => {
      state.commentDraftPosition = null;
    },
    closeOpenPropertyPanel: (state, action: PayloadAction<TOpenPropertyPanel>) => handleCloseOpenPropertyPanel(state, action.payload),
    convertGroupToBoolean: (state, action: PayloadAction<TBooleanNodesPayload>) => handleConvertGroupToBoolean(state, action.payload),
    convertGroupToMask: (state, action: PayloadAction<string>) => handleConvertGroupToMask(state, action.payload),
    createMaskGroup: {
      prepare: () => ({ payload: { groupId: nanoid() } }),
      reducer: (state, action: PayloadAction<{ groupId: string }>) =>
        handleSelectionPerParent(state, action.payload.groupId, handleUseNodesAsMask),
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
    removeNodeMask: (state, action: PayloadAction<string>) => handleRemoveNodeMask(state, action.payload),
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
    setGradientEditor: (state, action: PayloadAction<TGradientEditorState | null>) => {
      state.gradientEditor = action.payload;
    },
    setGridSectionHighlight: (state, action: PayloadAction<TGridSectionHighlight | null>) => {
      state.gridSectionHighlight = action.payload;
    },
    setGridSettingsPanelOpen: (state, action: PayloadAction<boolean>) => handleSetGridSettingsPanelOpen(state, action.payload),
    setGridTrackModeMenuRequest: (state, action: PayloadAction<TGridTrackModeMenuRequest | null>) => {
      state.gridTrackModeMenuRequest = action.payload;
    },
    setGridTrackSelection: (state, action: PayloadAction<TGridTrackSelection | null>) => {
      state.gridTrackSelection = action.payload;
    },
    setGridTrackValueEditRequest: (state, action: PayloadAction<TGridTrackValueEditRequest | null>) => {
      state.gridTrackValueEditRequest = action.payload;
    },
    setHoveredDimensionField: (state, action: PayloadAction<TDimensionHintField | null>) => {
      state.hoveredDimensionField = action.payload;
    },
    setImageEditor: (state, action: PayloadAction<TImageEditorState | null>) => handleSetImageEditor(state, action.payload),
    setImageFillPickerFocus: (state, action: PayloadAction<TImageFillPickerFocus | null>) => {
      state.imageFillPickerFocus = action.payload;
    },
    setIsExporting: (state, action: PayloadAction<boolean>) => {
      state.isExporting = action.payload;
    },
    setMediaToolArmed: (state, action: PayloadAction<boolean>) => {
      state.isMediaToolArmed = action.payload;
    },
    setMinMaxRevealed: (state, action: PayloadAction<{ bound: keyof TRevealedMinMax; value: boolean }>) => {
      state.revealedMinMax[action.payload.bound] = action.payload.value;
    },
    setOpenPropertyPanel: (state, action: PayloadAction<TOpenPropertyPanel | null>) => {
      state.openPropertyPanel = action.payload;
    },
    setPaint: (state, action: PayloadAction<TPaint>) => {
      getActivePage(state).paint = action.payload;
    },
    setPaintBlendMode: (state, action: PayloadAction<BlendMode>) => {
      getActivePage(state).paint.blendMode = action.payload;
    },
    setPanelGridTrackSelection: (state, action: PayloadAction<TGridTrackSelection | null>) => {
      state.panelGridTrackSelection = action.payload;
    },
    setPatternSourcePickTarget: (state, action: PayloadAction<TPatternSourcePickTarget | null>) => {
      state.patternSourcePickTarget = action.payload;
    },
    setPatternSourcePicking: (state, action: PayloadAction<boolean>) => {
      state.isPatternSourcePicking = action.payload;
    },
    setPenActiveVertexId: (state, action: PayloadAction<string | null>) => {
      state.penActiveVertexId = action.payload;
    },
    setSelectedFillIndices: (state, action: PayloadAction<number[]>) => {
      getActivePage(state).selectedFillIndices = action.payload;
    },
    setSelectedStrokeIndices: (state, action: PayloadAction<number[]>) => {
      getActivePage(state).selectedStrokeIndices = action.payload;
    },
    setSelection: (state, action: PayloadAction<string[]>) => handleSetSelection(state, action.payload),
    setTemporaryActiveTool: (state, action: PayloadAction<ToolName>) => {
      state.activeTool = action.payload;
    },
    setVectorEditingNodeIds: (state, action: PayloadAction<string[]>) => handleSetVectorEditingNodeIds(state, action.payload),
    setViewport: (state, action: PayloadAction<TViewport>) => handleSetViewport(state, action.payload),
    startAutoLayoutPaddingEdit: (state, action: PayloadAction<TAutoLayoutPaddingEditState>) => {
      state.editingAutoLayoutPadding = action.payload;
    },
    startCommentDraft: (state, action: PayloadAction<TPoint>) => {
      state.commentDraftPosition = action.payload;
    },
    startTextEdit: (state, action: PayloadAction<TStartTextEditPayload>) => handleStartTextEdit(state, action.payload),
    stopAutoLayoutPaddingEdit: (state, action: PayloadAction<{ frameId: string; side: TAutoLayoutPaddingSide }>) =>
      handleStopAutoLayoutPaddingEdit(state, action.payload),
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
    toggleLayoutGuidesVisible: (state) => {
      state.preferences.areLayoutGuidesVisible = !state.preferences.areLayoutGuidesVisible;
    },
    toggleMaskOutlinesVisible: (state) => {
      state.preferences.areMaskOutlinesVisible = !state.preferences.areMaskOutlinesVisible;
    },
    toggleNodeHidden: (state, action: PayloadAction<string>) => handleToggleNodeHidden(state, action.payload),
    toggleNodeLocked: (state, action: PayloadAction<string>) => handleToggleNodeLocked(state, action.payload),
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
    updateNodes: (state, action: PayloadAction<TUpdateNodesPayload>) => handleUpdateNodes(state, action.payload),
    updateTextEditContent: (state, action: PayloadAction<string>) => handleUpdateTextEditContent(state, action.payload),
    updateTextEditSelection: (state, action: PayloadAction<TTextEditSelection>) => handleUpdateTextEditSelection(state, action.payload),
    wrapInSection: {
      prepare: () => ({ payload: { sectionId: nanoid() } }),
      reducer: (state, action: PayloadAction<{ sectionId: string }>) => handleWrapInSection(state, action.payload.sectionId),
    },
  },
});

export const {
  addComment,
  addGuide,
  addNode,
  addNodes,
  addPage,
  booleanNodes,
  bringSelectionToFront,
  cancelCommentDraft,
  closeOpenPropertyPanel,
  convertGroupToBoolean,
  convertGroupToMask,
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
  removeNodeMask,
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
  setGradientEditor,
  setGridSectionHighlight,
  setGridSettingsPanelOpen,
  setGridTrackModeMenuRequest,
  setGridTrackSelection,
  setGridTrackValueEditRequest,
  setHoveredDimensionField,
  setImageEditor,
  setImageFillPickerFocus,
  setIsExporting,
  setMediaToolArmed,
  setMinMaxRevealed,
  setOpenPropertyPanel,
  setPaint,
  setPaintBlendMode,
  setPanelGridTrackSelection,
  setPatternSourcePickTarget,
  setPatternSourcePicking,
  setPenActiveVertexId,
  setSelectedFillIndices,
  setSelectedStrokeIndices,
  setSelection,
  setTemporaryActiveTool,
  setVectorEditingNodeIds,
  setViewport,
  startAutoLayoutPaddingEdit,
  startCommentDraft,
  startTextEdit,
  stopAutoLayoutPaddingEdit,
  stopTextEdit,
  toggleActionsPanelOpen,
  toggleAdditionalLabels,
  toggleFrameClipContent,
  toggleFrameOutlinesVisible,
  toggleLayoutGuidesVisible,
  toggleMaskOutlinesVisible,
  toggleNodeHidden,
  toggleNodeLocked,
  toggleRulers,
  toggleUiHidden,
  toggleUiMinimized,
  ungroupNodes,
  updateCommentContent,
  updateEditingTextBoxPathStartOffset,
  updateGuide,
  updateNode,
  updateNodes,
  updateTextEditContent,
  updateTextEditSelection,
  wrapInSection,
} = designSlice.actions;

export default designSlice.reducer;
