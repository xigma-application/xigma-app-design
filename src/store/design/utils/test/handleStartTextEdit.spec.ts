// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleStartTextEdit } from '../handleStartTextEdit';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activeTool: ToolName.default,
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
    handleStartTextEdit(state, { height: 20, width: 100, x: 10, y: 10 });

    // result
    expect(state.editingTextBox).toEqual({ height: 20, width: 100, x: 10, y: 10 });
  });

  it('should reset any leftover editing text content', () => {
    // mock
    const state = buildState({ editingTextContent: 'leftover' });

    // before
    handleStartTextEdit(state, { height: 20, width: 100, x: 10, y: 10 });

    // result
    expect(state.editingTextContent).toBe('');
  });
});
