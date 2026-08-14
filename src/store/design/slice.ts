import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

// others
import { DEFAULT_FRAME_TOOL, DEFAULT_MOUSE_TOOL, DEFAULT_SHAPE_TOOL, DEFAULT_TEXT_TOOL, DEFAULT_TOOL, DEFAULT_VIEWPORT } from './constants';

// types
import { TDesignState, TStartTextEditPayload, TTextEditSelection } from './types';
import { ToolName } from 'types/design/enums';
import { TNewSceneNode, TSceneNode, TSceneNodeChanges, TViewport } from 'types/design/types';

// utils
import { handleAddNode } from './utils/handleAddNode';
import { handleSetActiveTool } from './utils/handleSetActiveTool';
import { handleStartTextEdit } from './utils/handleStartTextEdit';
import { handleStopTextEdit } from './utils/handleStopTextEdit';
import { handleUpdateNode } from './utils/handleUpdateNode';
import { handleUpdateTextEditSelection } from './utils/handleUpdateTextEditSelection';

const initialState: TDesignState = {
  activeTool: DEFAULT_TOOL,
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
    addNode: {
      prepare: (node: TNewSceneNode) => ({ payload: { ...node, id: nanoid() } as TSceneNode }),
      reducer: (state, action: PayloadAction<TSceneNode>) => handleAddNode(state, action.payload),
    },
    setActiveTool: (state, action: PayloadAction<ToolName>) => handleSetActiveTool(state, action.payload),
    setSelection: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    setViewport: (state, action: PayloadAction<TViewport>) => {
      state.viewport = action.payload;
    },
    startTextEdit: (state, action: PayloadAction<TStartTextEditPayload>) => handleStartTextEdit(state, action.payload),
    stopTextEdit: (state) => handleStopTextEdit(state),
    updateNode: (state, action: PayloadAction<{ changes: TSceneNodeChanges; id: string }>) => handleUpdateNode(state, action.payload),
    updateTextEditContent: (state, action: PayloadAction<string>) => {
      state.editingTextContent = action.payload;
    },
    updateTextEditSelection: (state, action: PayloadAction<TTextEditSelection>) => handleUpdateTextEditSelection(state, action.payload),
  },
});

export const {
  addNode,
  setActiveTool,
  setSelection,
  setViewport,
  startTextEdit,
  stopTextEdit,
  updateNode,
  updateTextEditContent,
  updateTextEditSelection,
} = designSlice.actions;

export default designSlice.reducer;
