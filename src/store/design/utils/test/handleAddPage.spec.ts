// types
import { ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';

// utils
import { handleAddPage } from '../handleAddPage';

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
  isMediaToolArmed: false,
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

describe('handleAddPage', () => {
  it('should add an empty page named after the next free number and make it active', () => {
    // mock
    const state = buildState(['Page 1'], 'Page 1');

    // before
    handleAddPage(state, 'new-page');

    // result
    expect(state.pages['new-page']).toEqual({
      comments: {},
      guides: [],
      id: 'new-page',
      name: 'Page 2',
      nodes: {},
      paint: { color: '#D9D9D9', opacity: 100, type: 'solid' },
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    });
    expect(state.activePageId).toBe('new-page');
  });

  it('should insert the new page right after the active page', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2', 'Page 3', 'Page 4'], 'Page 2');

    // before
    handleAddPage(state, 'new-page');

    // result
    expect(Object.keys(state.pages)).toEqual(['Page 1', 'Page 2', 'new-page', 'Page 3', 'Page 4']);
    expect(state.pages['new-page'].name).toBe('Page 5');
  });

  it('should append the new page when the active page is the last one', () => {
    // mock
    const state = buildState(['Page 1', 'Page 2'], 'Page 2');

    // before
    handleAddPage(state, 'new-page');

    // result
    expect(Object.keys(state.pages)).toEqual(['Page 1', 'Page 2', 'new-page']);
  });
});
