// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleBringSelectionToFront } from '../handleBringSelectionToFront';

const buildRect = (id: string, parentId: string | null = null): TSceneNode =>
  ({ fill: '#ffffff', height: 10, id, name: id, parentId, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }) as TSceneNode;

const buildGroup = (id: string, childIds: string[]): TSceneNode =>
  ({ childIds, height: 10, id, name: id, parentId: null, rotation: 0, type: NodeType.group, width: 10, x: 0, y: 0 }) as TSceneNode;

const buildState = (page: Partial<TDesignPage>): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
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
      ...page,
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('handleBringSelectionToFront', () => {
  it('should move a top-level selected node to the end of rootOrder', () => {
    // mock — the concrete example from the request: [1, 2, 3], bring "1" to front -> [2, 3, 1]
    const state = buildState({
      nodes: { '1': buildRect('1'), '2': buildRect('2'), '3': buildRect('3') },
      rootOrder: ['1', '2', '3'],
      selectedIds: ['1'],
    });

    // before
    handleBringSelectionToFront(state);

    // result
    expect(state.pages['page-1'].rootOrder).toEqual(['2', '3', '1']);
  });

  it('should move a nested selected node to the end of its own parent group’s childIds, not rootOrder', () => {
    // mock
    const group = buildGroup('group-1', ['a', 'b']);
    const state = buildState({
      nodes: { a: buildRect('a', 'group-1'), b: buildRect('b', 'group-1'), 'group-1': group },
      rootOrder: ['group-1'],
      selectedIds: ['a'],
    });

    // before
    handleBringSelectionToFront(state);

    // result
    const page = state.pages['page-1'];
    expect((page.nodes['group-1'] as { childIds: string[] }).childIds).toEqual(['b', 'a']);
    expect(page.rootOrder).toEqual(['group-1']); // the group itself never moved
  });

  it('should move each selected node only within its own container when the selection spans several', () => {
    // mock
    const group = buildGroup('group-1', ['b', 'c']);
    const state = buildState({
      nodes: { a: buildRect('a'), b: buildRect('b', 'group-1'), c: buildRect('c', 'group-1'), 'group-1': group },
      rootOrder: ['a', 'group-1'],
      selectedIds: ['a', 'b'],
    });

    // before
    handleBringSelectionToFront(state);

    // result — "a" moves to the end of its own scope (rootOrder, where it's the only other
    // member besides the group); "b" moves to the end within the group, independently
    const page = state.pages['page-1'];
    expect(page.rootOrder).toEqual(['group-1', 'a']);
    expect((page.nodes['group-1'] as { childIds: string[] }).childIds).toEqual(['c', 'b']);
  });

  it('should preserve the relative order of multiple moved nodes among themselves', () => {
    // mock
    const state = buildState({
      nodes: { a: buildRect('a'), b: buildRect('b'), c: buildRect('c'), d: buildRect('d') },
      rootOrder: ['a', 'b', 'c', 'd'],
      selectedIds: ['a', 'c'],
    });

    // before
    handleBringSelectionToFront(state);

    // result
    expect(state.pages['page-1'].rootOrder).toEqual(['b', 'd', 'a', 'c']);
  });

  it('should be a no-op when nothing is selected', () => {
    // mock
    const state = buildState({
      nodes: { a: buildRect('a'), b: buildRect('b') },
      rootOrder: ['a', 'b'],
      selectedIds: [],
    });

    // before
    handleBringSelectionToFront(state);

    // result
    expect(state.pages['page-1'].rootOrder).toEqual(['a', 'b']);
  });
});
