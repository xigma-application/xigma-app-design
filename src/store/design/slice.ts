import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

// others
import { DEFAULT_FRAME_TOOL, DEFAULT_MOUSE_TOOL, DEFAULT_SHAPE_TOOL, DEFAULT_TEXT_TOOL, DEFAULT_TOOL, DEFAULT_VIEWPORT } from './constants';

// types
import { TDesignState, TStartTextEditPayload, TTextEditSelection } from './types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TNewSceneNode, TSceneNode, TSceneNodeChanges, TViewport } from 'types/design/types';

// utils
import { handleAddComment } from './utils/handleAddComment';
import { handleAddNode } from './utils/handleAddNode';
import { handleDeleteNode } from './utils/handleDeleteNode';
import { handleSetActiveTool } from './utils/handleSetActiveTool';
import { handleSetSelection } from './utils/handleSetSelection';
import { handleSetViewport } from './utils/handleSetViewport';
import { handleStartTextEdit } from './utils/handleStartTextEdit';
import { handleStopTextEdit } from './utils/handleStopTextEdit';
import { handleUpdateCommentContent } from './utils/handleUpdateCommentContent';
import { handleUpdateEditingTextBoxPathStartOffset } from './utils/handleUpdateEditingTextBoxPathStartOffset';
import { handleUpdateNode } from './utils/handleUpdateNode';
import { handleUpdateTextEditContent } from './utils/handleUpdateTextEditContent';
import { handleUpdateTextEditSelection } from './utils/handleUpdateTextEditSelection';

const initialState: TDesignState = {
  activeTool: DEFAULT_TOOL,
  commentDraftPosition: null,
  comments: {},
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  lastFrameTool: DEFAULT_FRAME_TOOL,
  lastMouseTool: DEFAULT_MOUSE_TOOL,
  lastShapeTool: DEFAULT_SHAPE_TOOL,
  lastTextTool: DEFAULT_TEXT_TOOL,
  nodes: {},
  rootOrder: [],
  selectedIds: [],
  viewport: DEFAULT_VIEWPORT,
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
    cancelCommentDraft: (state) => {
      state.commentDraftPosition = null;
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      delete state.comments[action.payload];
    },
    deleteNode: (state, action: PayloadAction<string>) => handleDeleteNode(state, action.payload),
    setActiveTool: (state, action: PayloadAction<ToolName>) => handleSetActiveTool(state, action.payload),
    setSelection: (state, action: PayloadAction<string[]>) => handleSetSelection(state, action.payload),
    setViewport: (state, action: PayloadAction<TViewport>) => handleSetViewport(state, action.payload),
    startCommentDraft: (state, action: PayloadAction<TPoint>) => {
      state.commentDraftPosition = action.payload;
    },
    startTextEdit: (state, action: PayloadAction<TStartTextEditPayload>) => handleStartTextEdit(state, action.payload),
    stopTextEdit: (state) => handleStopTextEdit(state),
    updateEditingTextBoxPathStartOffset: (state, action: PayloadAction<number>) =>
      handleUpdateEditingTextBoxPathStartOffset(state, action.payload),
    updateCommentContent: (state, action: PayloadAction<{ content: string; id: string }>) =>
      handleUpdateCommentContent(state, action.payload),
    updateNode: (state, action: PayloadAction<{ changes: TSceneNodeChanges; id: string }>) => handleUpdateNode(state, action.payload),
    updateTextEditContent: (state, action: PayloadAction<string>) => handleUpdateTextEditContent(state, action.payload),
    updateTextEditSelection: (state, action: PayloadAction<TTextEditSelection>) => handleUpdateTextEditSelection(state, action.payload),
  },
});

export const {
  addComment,
  addNode,
  cancelCommentDraft,
  deleteComment,
  deleteNode,
  setActiveTool,
  setSelection,
  setViewport,
  startCommentDraft,
  startTextEdit,
  stopTextEdit,
  updateCommentContent,
  updateEditingTextBoxPathStartOffset,
  updateNode,
  updateTextEditContent,
  updateTextEditSelection,
} = designSlice.actions;

export default designSlice.reducer;
