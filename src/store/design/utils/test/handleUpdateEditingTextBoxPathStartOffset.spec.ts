// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleUpdateEditingTextBoxPathStartOffset } from '../handleUpdateEditingTextBoxPathStartOffset';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activeTool: ToolName.default,
  commentDraftPosition: null,
  comments: {},
  editingNodeId: 'node-1',
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 2,
  editingSelectionStart: 0,
  editingTextBox: { flipX: false, flipY: false, height: 200, pathId: 'ellipse-1', pathStartOffset: 0, rotation: 0, width: 200, x: 0, y: 0 },
  editingTextContent: 'Hi',
  isUiMinimized: false,
  lastFrameTool: ToolName.frame,
  lastMoreTool: null,
  lastMouseTool: ToolName.default,
  lastPenTool: ToolName.pen,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  nodes: {},
  paintColor: '#d9d9d9',
  penActiveVertexId: null,
  rootOrder: [],
  selectedIds: [],
  vectorEditingNodeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('handleUpdateEditingTextBoxPathStartOffset', () => {
  it("should update the editing box's pathStartOffset in place", () => {
    // mock
    const state = buildState();

    // before
    handleUpdateEditingTextBoxPathStartOffset(state, 0.25);

    // result
    expect(state.editingTextBox).toMatchObject({ pathStartOffset: 0.25 });
  });

  it('should leave the rest of the editing box untouched', () => {
    // mock
    const state = buildState();

    // before
    handleUpdateEditingTextBoxPathStartOffset(state, 0.25);

    // result
    expect(state.editingTextBox).toMatchObject({ height: 200, pathId: 'ellipse-1', rotation: 0, width: 200, x: 0, y: 0 });
  });

  it('should do nothing when there is no editing box', () => {
    // mock
    const state = buildState({ editingTextBox: null });

    // before
    handleUpdateEditingTextBoxPathStartOffset(state, 0.25);

    // result
    expect(state.editingTextBox).toBeNull();
  });
});
