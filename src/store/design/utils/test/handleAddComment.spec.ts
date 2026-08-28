// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleAddComment } from '../handleAddComment';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activeTool: ToolName.comment,
  commentDraftPosition: null,
  comments: {},
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
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

describe('handleAddComment', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add a comment at the draft position with the mock author, then clear the draft', () => {
    // mock
    const state = buildState({ commentDraftPosition: { x: 10, y: 20 } });

    // before
    handleAddComment(state, { content: 'hello', id: 'comment-1' });

    // result
    expect(state.comments['comment-1']).toEqual({
      author: 'Xigma',
      content: 'hello',
      createdAt: 1000,
      id: 'comment-1',
      x: 10,
      y: 20,
    });
    expect(state.commentDraftPosition).toBeNull();
  });

  it('should do nothing when there is no open draft', () => {
    // mock
    const state = buildState({ commentDraftPosition: null });

    // before
    handleAddComment(state, { content: 'hello', id: 'comment-1' });

    // result
    expect(state.comments).toEqual({});
  });
});
