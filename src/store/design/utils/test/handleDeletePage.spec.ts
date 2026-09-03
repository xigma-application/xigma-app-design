// types
import { ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';

// utils
import { handleDeletePage } from '../handleDeletePage';

const buildPage = (name: string): TDesignPage => ({
  comments: {},
  guides: [],
  id: name,
  name,
  nodes: {},
  paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

const buildState = (pageNames: string[], activePageId: string): TDesignState => ({
  activePageId,
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
  pages: Object.fromEntries(pageNames.map((name) => [name, buildPage(name)])),
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('handleDeletePage', () => {
  it('should remove the page while keeping the order of the rest', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2', 'Page 3'], 'Page 1');

    // before
    handleDeletePage(state, 'Page 2');

    // result
    expect(Object.keys(state.pages)).toEqual(['Page 1', 'Page 3']);
  });

  it('should move the active page to the previous one when the active page is deleted', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2', 'Page 3'], 'Page 2');

    // before
    handleDeletePage(state, 'Page 2');

    // result
    expect(state.activePageId).toBe('Page 1');
  });

  it('should fall back to the first page when the deleted active page was the first', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2'], 'Page 1');

    // before
    handleDeletePage(state, 'Page 1');

    // result
    expect(state.activePageId).toBe('Page 2');
  });

  it('should not change the active page when a non-active page is deleted', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2', 'Page 3'], 'Page 3');

    // before
    handleDeletePage(state, 'Page 1');

    // result
    expect(state.activePageId).toBe('Page 3');
  });

  it('should do nothing when only one page is left', () => {
    // mock
    const state = buildState(['Page 1'], 'Page 1');

    // before
    handleDeletePage(state, 'Page 1');

    // result
    expect(Object.keys(state.pages)).toEqual(['Page 1']);
  });

  it('should do nothing when the page does not exist', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2'], 'Page 1');

    // before
    handleDeletePage(state, 'missing');

    // result
    expect(Object.keys(state.pages)).toEqual(['Page 1', 'Page 2']);
  });
});
