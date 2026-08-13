// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleStopTextEdit } from '../handleStopTextEdit';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activeTool: ToolName.default,
  editingNodeId: 'node-1',
  editingTextBox: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
  editingTextContent: 'hello',
  lastMouseTool: ToolName.default,
  lastShapeTool: ToolName.rectangle,
  nodes: {},
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('handleStopTextEdit', () => {
  it('should clear the editing text box', () => {
    // mock
    const state = buildState();

    // before
    handleStopTextEdit(state);

    // result
    expect(state.editingTextBox).toBeNull();
  });

  it('should clear the editing text content', () => {
    // mock
    const state = buildState();

    // before
    handleStopTextEdit(state);

    // result
    expect(state.editingTextContent).toBe('');
  });

  it('should clear the editing node id', () => {
    // mock
    const state = buildState();

    // before
    handleStopTextEdit(state);

    // result
    expect(state.editingNodeId).toBeNull();
  });
});
