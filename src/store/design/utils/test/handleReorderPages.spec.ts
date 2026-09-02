// types
import { ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';

// utils
import { handleReorderPages } from '../handleReorderPages';

const buildPage = (name: string): TDesignPage => ({
  comments: {},
  id: name,
  name,
  nodes: {},
  paintColor: '#d9d9d9',
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

const buildState = (pageNames: string[], activePageId: string): TDesignState => ({
  activePageId,
  activeTool: ToolName.default,
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
  pages: Object.fromEntries(pageNames.map((name) => [name, buildPage(name)])),
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('handleReorderPages', () => {
  it('should move a page forward in the order', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2', 'Page 3', 'Page 4'], 'Page 1');

    // before
    handleReorderPages(state, { fromIndex: 0, toIndex: 2 });

    // result
    expect(Object.keys(state.pages)).toEqual(['Page 2', 'Page 3', 'Page 1', 'Page 4']);
  });

  it('should move a page backward in the order', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2', 'Page 3', 'Page 4'], 'Page 1');

    // before
    handleReorderPages(state, { fromIndex: 3, toIndex: 0 });

    // result
    expect(Object.keys(state.pages)).toEqual(['Page 4', 'Page 1', 'Page 2', 'Page 3']);
  });

  it('should not change activePageId or any page content', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2', 'Page 3'], 'Page 2');
    const pageTwoBefore = state.pages['Page 2'];

    // before
    handleReorderPages(state, { fromIndex: 0, toIndex: 2 });

    // result
    expect(state.activePageId).toBe('Page 2');
    expect(state.pages['Page 2']).toBe(pageTwoBefore);
  });

  it('should do nothing when fromIndex is out of range', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2'], 'Page 1');

    // before
    handleReorderPages(state, { fromIndex: 5, toIndex: 0 });

    // result
    expect(Object.keys(state.pages)).toEqual(['Page 1', 'Page 2']);
  });
});
