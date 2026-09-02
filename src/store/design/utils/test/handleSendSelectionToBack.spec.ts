// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleSendSelectionToBack } from '../handleSendSelectionToBack';

const buildRect = (id: string, parentId: string | null = null): TSceneNode =>
  ({ fill: '#ffffff', height: 10, id, name: id, parentId, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }) as TSceneNode;

const buildGroup = (id: string, childIds: string[]): TSceneNode =>
  ({ childIds, height: 10, id, name: id, parentId: null, rotation: 0, type: NodeType.group, width: 10, x: 0, y: 0 }) as TSceneNode;

const buildState = (page: Partial<TDesignPage>): TDesignState => ({
  activePageId: 'page-1',
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

describe('handleSendSelectionToBack', () => {
  it('should move a top-level selected node to the start of rootOrder', () => {
    // mock — [1, 2, 3], send "3" to back -> [3, 1, 2]
    const state = buildState({
      nodes: { '1': buildRect('1'), '2': buildRect('2'), '3': buildRect('3') },
      rootOrder: ['1', '2', '3'],
      selectedIds: ['3'],
    });

    // before
    handleSendSelectionToBack(state);

    // result
    expect(state.pages['page-1'].rootOrder).toEqual(['3', '1', '2']);
  });

  it('should move a nested selected node to the start of its own parent group’s childIds, not rootOrder', () => {
    // mock
    const group = buildGroup('group-1', ['a', 'b']);
    const state = buildState({
      nodes: { a: buildRect('a', 'group-1'), b: buildRect('b', 'group-1'), 'group-1': group },
      rootOrder: ['group-1'],
      selectedIds: ['b'],
    });

    // before
    handleSendSelectionToBack(state);

    // result
    const page = state.pages['page-1'];
    expect((page.nodes['group-1'] as { childIds: string[] }).childIds).toEqual(['b', 'a']);
    expect(page.rootOrder).toEqual(['group-1']); // the group itself never moved
  });

  it('should move each selected node only within its own container when the selection spans several', () => {
    // mock — "a" starts second in rootOrder, so its own move is actually visible
    const group = buildGroup('group-1', ['b', 'c']);
    const state = buildState({
      nodes: { a: buildRect('a'), b: buildRect('b', 'group-1'), c: buildRect('c', 'group-1'), 'group-1': group },
      rootOrder: ['group-1', 'a'],
      selectedIds: ['a', 'c'],
    });

    // before
    handleSendSelectionToBack(state);

    // result — "a" moves to the start of its own scope (rootOrder); "c" moves to the start
    // within the group, independently
    const page = state.pages['page-1'];
    expect(page.rootOrder).toEqual(['a', 'group-1']);
    expect((page.nodes['group-1'] as { childIds: string[] }).childIds).toEqual(['c', 'b']);
  });

  it('should preserve the relative order of multiple moved nodes among themselves', () => {
    // mock
    const state = buildState({
      nodes: { a: buildRect('a'), b: buildRect('b'), c: buildRect('c'), d: buildRect('d') },
      rootOrder: ['a', 'b', 'c', 'd'],
      selectedIds: ['b', 'd'],
    });

    // before
    handleSendSelectionToBack(state);

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
    handleSendSelectionToBack(state);

    // result
    expect(state.pages['page-1'].rootOrder).toEqual(['a', 'b']);
  });
});
