// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { handleDuplicatePage } from '../handleDuplicatePage';

const frame = (id: string, parentId: string | null = null): TSceneNode => ({
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 10,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

const buildPage = (id: string, overrides: Partial<TDesignPage> = {}): TDesignPage => ({
  backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  comments: {},
  guides: [],
  id,
  name: id,
  nodes: {},
  paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

const buildState = (pages: TDesignPage[], activePageId: string): TDesignState => ({
  activePageId,
  activeTool: ToolName.default,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  commentDraftPosition: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isActionsPanelOpen: false,
  isMediaToolArmed: false,
  designHintLabelKey: null,
  isUiHidden: false,
  isUiMinimized: false,
  lastFrameTool: ToolName.frame,
  lastMoreTool: null,
  lastMouseTool: ToolName.default,
  lastPenTool: ToolName.pen,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  pages: Object.fromEntries(pages.map((page) => [page.id, page])),
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('handleDuplicatePage', () => {
  it('should clone the source page after it, remap node ids and activate the copy', () => {
    // mock
    const source = buildPage('page-1', {
      name: 'Page 1',
      nodes: { child: frame('child', 'parent'), parent: frame('parent') },
      rootOrder: ['parent', 'child'],
      selectedIds: [],
    });
    const state = buildState([source, buildPage('page-2')], 'page-1');

    // before
    handleDuplicatePage(state, { newPageId: 'copy', nodeIdMap: { child: 'child-2', parent: 'parent-2' }, sourceId: 'page-1' });

    // result
    expect(Object.keys(state.pages)).toEqual(['page-1', 'copy', 'page-2']);
    expect(state.activePageId).toBe('copy');
    expect(state.pages.copy.name).toBe('Page 1 copy');
    expect(state.pages.copy.rootOrder).toEqual(['parent-2', 'child-2']);
    expect(state.pages.copy.nodes['child-2'].parentId).toBe('parent-2');
    expect(state.pages.copy.nodes['parent-2'].id).toBe('parent-2');
  });

  it('should remap a text node pathId reference', () => {
    // mock
    const textNode: TSceneNode = {
      content: 'hi',
      fill: '#000',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 16,
      height: 10,
      id: 'text',
      name: 'text',
      parentId: null,
      pathId: 'path',
      rotation: 0,
      type: NodeType.text,
      width: 10,
      x: 0,
      y: 0,
    };
    const source = buildPage('page-1', { nodes: { text: textNode }, rootOrder: ['text'] });
    const state = buildState([source], 'page-1');

    // before
    handleDuplicatePage(state, { newPageId: 'copy', nodeIdMap: { path: 'path-2', text: 'text-2' }, sourceId: 'page-1' });

    // result
    const cloned = state.pages.copy.nodes['text-2'];

    expect(cloned.type === NodeType.text && cloned.pathId).toBe('path-2');
  });

  it('should deep-clone nodes so edits to the copy do not leak into the source', () => {
    // mock
    const source = buildPage('page-1', { nodes: { a: frame('a') }, rootOrder: ['a'] });
    const state = buildState([source], 'page-1');

    // before
    handleDuplicatePage(state, { newPageId: 'copy', nodeIdMap: { a: 'a-2' }, sourceId: 'page-1' });
    (state.pages.copy.nodes['a-2'] as TFrameNode).x = 999;

    // result
    expect((state.pages['page-1'].nodes.a as TFrameNode).x).toBe(0);
  });

  it('should leave ids that are absent from the map untouched', () => {
    // mock
    const source = buildPage('page-1', { nodes: { a: frame('a', 'ghost-parent') }, rootOrder: ['a', 'stale'] });
    const state = buildState([source], 'page-1');

    // before
    handleDuplicatePage(state, { newPageId: 'copy', nodeIdMap: { a: 'a-2' }, sourceId: 'page-1' });

    // result
    expect(state.pages.copy.nodes['a-2'].parentId).toBe('ghost-parent');
    expect(state.pages.copy.rootOrder).toEqual(['a-2', 'stale']);
  });

  it('should deep-clone page-level guides so edits to the copy do not leak into the source', () => {
    // mock
    const source = buildPage('page-1', { guides: [{ axis: 'x', id: 'guide-1', position: 100 }] });
    const state = buildState([source], 'page-1');

    // before
    handleDuplicatePage(state, { newPageId: 'copy', nodeIdMap: {}, sourceId: 'page-1' });
    state.pages.copy.guides[0].position = 999;

    // result
    expect(state.pages['page-1'].guides[0].position).toBe(100);
  });

  it('should do nothing when the source page does not exist', () => {
    // mock
    const state = buildState([buildPage('page-1')], 'page-1');

    // before
    handleDuplicatePage(state, { newPageId: 'copy', nodeIdMap: {}, sourceId: 'missing' });

    // result
    expect(Object.keys(state.pages)).toEqual(['page-1']);
    expect(state.activePageId).toBe('page-1');
  });
});
