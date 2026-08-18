// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleUpdateCommentContent } from '../handleUpdateCommentContent';

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
  lastFrameTool: ToolName.frame,
  lastMouseTool: ToolName.default,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  nodes: {},
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('handleUpdateCommentContent', () => {
  it('should update the content of an existing comment', () => {
    // mock
    const state = buildState({ comments: { 'comment-1': { author: 'Xigma', content: 'hello', id: 'comment-1', x: 0, y: 0 } } });

    // before
    handleUpdateCommentContent(state, { content: 'updated', id: 'comment-1' });

    // result
    expect(state.comments['comment-1'].content).toBe('updated');
  });

  it('should do nothing when the comment does not exist', () => {
    // mock
    const state = buildState();

    // before
    handleUpdateCommentContent(state, { content: 'updated', id: 'missing' });

    // result
    expect(state.comments).toEqual({});
  });
});
