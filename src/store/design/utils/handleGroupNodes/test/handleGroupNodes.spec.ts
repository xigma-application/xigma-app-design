// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { handleGroupNodes } from '../handleGroupNodes';

const buildRect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

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
      guides: [],
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

describe('handleGroupNodes', () => {
  it('should wrap the selected top-level nodes into a group at the topmost member slot', () => {
    // mock
    const a = buildRect({ height: 20, id: 'a', width: 20, x: 0, y: 0 });
    const b = buildRect({ height: 10, id: 'b', width: 10, x: 40, y: 30 });
    const c = buildRect({ id: 'c', x: 100, y: 100 });
    const state = buildState({
      nodes: { a, b, c },
      rootOrder: ['a', 'b', 'c'],
      selectedIds: ['a', 'c'],
    });

    // action
    handleGroupNodes(state, 'group-1');

    // result
    const page = getActivePage(state);
    const group = page.nodes['group-1'] as TGroupNode;
    expect(group.type).toBe(NodeType.group);
    expect(group.childIds).toEqual(['a', 'c']);
    expect(page.nodes.a.parentId).toBe('group-1');
    expect(page.nodes.c.parentId).toBe('group-1');
    expect(page.rootOrder).toEqual(['b', 'group-1']);
    expect(page.selectedIds).toEqual(['group-1']);
    expect(group).toMatchObject({ height: 110, width: 110, x: 0, y: 0 });
  });

  it('should wrap a single selected node in a new group by itself', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'], selectedIds: ['a'] });

    // action
    handleGroupNodes(state, 'group-1');

    // result
    const page = getActivePage(state);
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual(['a']);
    expect(page.nodes.a.parentId).toBe('group-1');
    expect(page.rootOrder).toEqual(['group-1']);
  });

  it('should wrap an already-nested group in another group, arbitrarily many times', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'], selectedIds: ['a'] });

    // action — group 'a' alone, then group the resulting group alone, then group that one too
    // (handleGroupNodes selects the newly created group each time, so no manual reselection is needed)
    handleGroupNodes(state, 'group-1');
    handleGroupNodes(state, 'group-2');
    handleGroupNodes(state, 'group-3');

    // result — three levels of group nesting, each wrapping the previous one
    const page = getActivePage(state);
    expect(page.rootOrder).toEqual(['group-3']);
    expect((page.nodes['group-3'] as TGroupNode).childIds).toEqual(['group-2']);
    expect((page.nodes['group-2'] as TGroupNode).childIds).toEqual(['group-1']);
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual(['a']);
    expect(page.nodes['group-2'].parentId).toBe('group-3');
    expect(page.nodes['group-1'].parentId).toBe('group-2');
    expect(page.nodes.a.parentId).toBe('group-1');
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    const state = buildState({ nodes: {}, rootOrder: [], selectedIds: [] });

    // action
    handleGroupNodes(state, 'group-1');

    // result
    expect(getActivePage(state).nodes['group-1']).toBeUndefined();
  });

  it('should steal a node out of its existing group into a new top-level group when the outside node was selected first', () => {
    // mock — group-1 = [n1, n2], n3 is a separate top-level sibling. Figma semantics: selecting the
    // outsider (n3) first, then a member of the group (n2), pulls n2 out into a brand new group that
    // forms where n3 used to live — group-1 is left with only n1
    const n1 = buildRect({ id: 'n1', parentId: 'group-1', x: 0, y: 0 });
    const n2 = buildRect({ id: 'n2', parentId: 'group-1', x: 20, y: 0 });
    const n3 = buildRect({ id: 'n3', x: 100, y: 0 });
    const group1: TGroupNode = {
      childIds: ['n1', 'n2'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 30,
      x: 0,
      y: 0,
    };
    const state = buildState({
      nodes: { 'group-1': group1, n1, n2, n3 },
      rootOrder: ['group-1', 'n3'],
      selectedIds: ['n3', 'n2'],
    });

    // action
    handleGroupNodes(state, 'group-2');

    // result
    const page = getActivePage(state);
    expect((page.nodes['group-2'] as TGroupNode).childIds).toEqual(['n3', 'n2']);
    expect(page.nodes.n2.parentId).toBe('group-2');
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual(['n1']);
    expect(page.rootOrder).toEqual(['group-1', 'group-2']);
  });

  it('should nest the new group inside the existing group, in place, when a group member was selected first', () => {
    // mock — same starting point as above (group-1 = [n1, n2], n3 top-level), but this time n2 (the
    // group member) is selected first, then n3 (the outsider). Figma semantics: the new group forms
    // INSIDE group-1, replacing n2's own slot, and steals n3 in from the top level to join it —
    // n1 is left untouched as group-1's other child
    const n1 = buildRect({ id: 'n1', parentId: 'group-1', x: 0, y: 0 });
    const n2 = buildRect({ id: 'n2', parentId: 'group-1', x: 20, y: 0 });
    const n3 = buildRect({ id: 'n3', x: 100, y: 0 });
    const group1: TGroupNode = {
      childIds: ['n1', 'n2'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 30,
      x: 0,
      y: 0,
    };
    const state = buildState({
      nodes: { 'group-1': group1, n1, n2, n3 },
      rootOrder: ['group-1', 'n3'],
      selectedIds: ['n2', 'n3'],
    });

    // action
    handleGroupNodes(state, 'group-2');

    // result
    const page = getActivePage(state);
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual(['n1', 'group-2']);
    expect((page.nodes['group-2'] as TGroupNode).childIds).toEqual(['n2', 'n3']);
    expect((page.nodes['group-2'] as TGroupNode).parentId).toBe('group-1');
    expect(page.nodes.n1.parentId).toBe('group-1');
    expect(page.rootOrder).toEqual(['group-1']);
  });

  it('should nest the new group inside the shared parent group', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'outer', x: 0, y: 0 });
    const b = buildRect({ id: 'b', parentId: 'outer', x: 50, y: 0 });
    const outer: TGroupNode = {
      childIds: ['a', 'b'],
      height: 10,
      id: 'outer',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 60,
      x: 0,
      y: 0,
    };
    const state = buildState({
      nodes: { a, b, outer },
      rootOrder: ['outer'],
      selectedIds: ['a', 'b'],
    });

    // action
    handleGroupNodes(state, 'group-1');

    // result
    const page = getActivePage(state);
    expect((page.nodes.outer as TGroupNode).childIds).toEqual(['group-1']);
    expect((page.nodes['group-1'] as TGroupNode).parentId).toBe('outer');
    expect(page.nodes.a.parentId).toBe('group-1');
  });

  it('should delete the old group entirely once its last remaining child is stolen away', () => {
    // mock — group-1 has only a single child, n1; stealing n1 out leaves group-1 empty
    const n1 = buildRect({ id: 'n1', parentId: 'group-1', x: 0, y: 0 });
    const n2 = buildRect({ id: 'n2', x: 100, y: 0 });
    const group1: TGroupNode = {
      childIds: ['n1'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({
      nodes: { 'group-1': group1, n1, n2 },
      rootOrder: ['group-1', 'n2'],
      selectedIds: ['n2', 'n1'],
    });

    // action
    handleGroupNodes(state, 'group-2');

    // result
    const page = getActivePage(state);
    expect((page.nodes['group-2'] as TGroupNode).childIds).toEqual(['n2', 'n1']);
    expect(page.nodes['group-1']).toBeUndefined();
    expect(page.rootOrder).toEqual(['group-2']);
  });

  it('should no-op when the target parent would end up nested inside one of the nodes being grouped', () => {
    // mock — 'inner' (a direct child of 'outer') selected first, together with 'outer' itself; the
    // target would be 'outer' (inner's own parent), which is also one of the selected nodes — grouping
    // that would nest 'outer' inside a new group living inside itself, a cycle, so this must no-op
    const inner = buildRect({ id: 'inner', parentId: 'outer', x: 0, y: 0 });
    const outer: TGroupNode = {
      childIds: ['inner'],
      height: 10,
      id: 'outer',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({
      nodes: { inner, outer },
      rootOrder: ['outer'],
      selectedIds: ['inner', 'outer'],
    });

    // action
    handleGroupNodes(state, 'group-1');

    // result — nothing changed
    const page = getActivePage(state);
    expect(page.nodes['group-1']).toBeUndefined();
    expect(page.rootOrder).toEqual(['outer']);
    expect((page.nodes.outer as TGroupNode).childIds).toEqual(['inner']);
  });
});
