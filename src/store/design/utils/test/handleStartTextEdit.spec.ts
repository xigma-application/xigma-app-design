// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleStartTextEdit } from '../handleStartTextEdit';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  areAdditionalLabelsVisible: true,
  areRulersVisible: false,
  commentDraftPosition: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isActionsPanelOpen: false,
  isUiHidden: false,
  isUiMinimized: false,
  lastFrameTool: ToolName.frame,
  lastMoreTool: null,
  lastMouseTool: ToolName.default,
  lastPenTool: ToolName.pen,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  pages: {
    'page-1': {
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes: {},
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
  ...overrides,
});

describe('handleStartTextEdit', () => {
  it('should set the editing text box', () => {
    // mock
    const state = buildState();

    // before
    handleStartTextEdit(state, { box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingTextBox).toEqual({ flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 });
  });

  it("should carry the box's rotation and mirror through as given, not just the zero defaults", () => {
    // mock
    const state = buildState();

    // before
    handleStartTextEdit(state, { box: { flipX: true, flipY: true, height: 20, rotation: 30, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingTextBox).toMatchObject({ flipX: true, flipY: true, rotation: 30 });
  });

  it('should reset any leftover editing text content when starting a brand-new (contentless) edit', () => {
    // mock
    const state = buildState({ editingTextContent: 'leftover' });

    // before
    handleStartTextEdit(state, { box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingTextContent).toBe('');
  });

  it('should default the editing node id to null when none is given', () => {
    // mock
    const state = buildState({ editingNodeId: 'leftover-id' });

    // before
    handleStartTextEdit(state, { box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingNodeId).toBeNull();
  });

  it('should seed the editing node id and content when editing an existing node', () => {
    // mock
    const state = buildState();

    // before
    handleStartTextEdit(state, {
      box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
      content: 'hello',
      id: 'node-1',
    });

    // result
    expect(state.editingNodeId).toBe('node-1');
    expect(state.editingTextContent).toBe('hello');
  });

  it('should select all existing content when editing an existing node', () => {
    // mock
    const state = buildState();

    // before
    handleStartTextEdit(state, {
      box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
      content: 'hello',
      id: 'node-1',
    });

    // result
    expect(state.editingSelectionStart).toBe(0);
    expect(state.editingSelectionEnd).toBe(5);
  });

  it('should start with a collapsed selection when drawing a brand-new (contentless) box', () => {
    // mock
    const state = buildState();

    // before
    handleStartTextEdit(state, { box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingSelectionStart).toBe(0);
    expect(state.editingSelectionEnd).toBe(0);
  });

  it('should stamp when the selection was seeded, so the caret starts solid instead of mid-blink', () => {
    // mock
    const state = buildState({ editingSelectionChangedAt: 0 });

    vi.spyOn(Date, 'now').mockReturnValue(12345);

    // before
    handleStartTextEdit(state, { box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } });

    // result
    expect(state.editingSelectionChangedAt).toBe(12345);

    // after
    vi.restoreAllMocks();
  });
});
