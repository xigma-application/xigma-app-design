// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { handleUpdateCommentContent } from '../handleUpdateCommentContent';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.comment,
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
      id: 'page-1',
      name: 'Page 1',
      nodes: {},
      paintColor: '#d9d9d9',
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
  ...overrides,
});

describe('handleUpdateCommentContent', () => {
  it('should update the content of an existing comment', () => {
    // mock
    const state = buildState({
      pages: {
        'page-1': {
          comments: { 'comment-1': { author: 'Xigma', content: 'hello', createdAt: 0, id: 'comment-1', x: 0, y: 0 } },
          id: 'page-1',
          name: 'Page 1',
          nodes: {},
          paintColor: '#d9d9d9',
          rootOrder: [],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
    });

    // before
    handleUpdateCommentContent(state, { content: 'updated', id: 'comment-1' });

    // result
    expect(getActivePage(state).comments['comment-1'].content).toBe('updated');
  });

  it('should do nothing when the comment does not exist', () => {
    // mock
    const state = buildState();

    // before
    handleUpdateCommentContent(state, { content: 'updated', id: 'missing' });

    // result
    expect(getActivePage(state).comments).toEqual({});
  });
});
