// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleStartTextEdit } from '../handleStartTextEdit';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activeTool: ToolName.default,
  editingNodeId: null,
  editingTextBox: null,
  editingTextContent: '',
  lastMouseTool: ToolName.default,
  lastShapeTool: ToolName.rectangle,
  nodes: {},
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('handleStartTextEdit', () => {
  it('should set the editing text box', () => {
    // mock
    const state = buildState();

    // before
    handleStartTextEdit(state, { box: { height: 20, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingTextBox).toEqual({ height: 20, width: 100, x: 10, y: 10 });
  });

  it('should reset any leftover editing text content when starting a brand-new (contentless) edit', () => {
    // mock
    const state = buildState({ editingTextContent: 'leftover' });

    // before
    handleStartTextEdit(state, { box: { height: 20, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingTextContent).toBe('');
  });

  it('should default the editing node id to null when none is given', () => {
    // mock
    const state = buildState({ editingNodeId: 'leftover-id' });

    // before
    handleStartTextEdit(state, { box: { height: 20, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingNodeId).toBeNull();
  });

  it('should seed the editing node id and content when editing an existing node', () => {
    // mock
    const state = buildState();

    // before
    handleStartTextEdit(state, { box: { height: 20, width: 100, x: 10, y: 10 }, content: 'hello', id: 'node-1' });

    // result
    expect(state.editingNodeId).toBe('node-1');
    expect(state.editingTextContent).toBe('hello');
  });
});
