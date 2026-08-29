// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleReorderNode } from '../handleReorderNode';

const buildState = (rootOrder: string[]): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  commentDraftPosition: null,
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
  pages: {
    'page-1': {
      comments: {},
      id: 'page-1',
      name: 'Page 1',
      nodes: {},
      paintColor: '#d9d9d9',
      rootOrder,
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('handleReorderNode', () => {
  it('should move a node forward in the active page rootOrder', () => {
    // mock
    const state = buildState(['a', 'b', 'c', 'd']);

    // before
    handleReorderNode(state, { fromIndex: 0, toIndex: 2 });

    // result
    expect(state.pages['page-1'].rootOrder).toEqual(['b', 'c', 'a', 'd']);
  });

  it('should move a node backward in the active page rootOrder', () => {
    // mock
    const state = buildState(['a', 'b', 'c', 'd']);

    // before
    handleReorderNode(state, { fromIndex: 3, toIndex: 0 });

    // result
    expect(state.pages['page-1'].rootOrder).toEqual(['d', 'a', 'b', 'c']);
  });

  it('should do nothing when fromIndex is out of range', () => {
    // mock
    const state = buildState(['a', 'b']);

    // before
    handleReorderNode(state, { fromIndex: 5, toIndex: 0 });

    // result
    expect(state.pages['page-1'].rootOrder).toEqual(['a', 'b']);
  });
});
