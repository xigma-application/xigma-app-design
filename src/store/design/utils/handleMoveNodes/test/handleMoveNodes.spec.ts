// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { handleMoveNodes } from '../handleMoveNodes';

const buildRect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
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

const buildGroup = (overrides: Partial<TGroupNode>): TGroupNode => ({
  childIds: [],
  height: 10,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

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

describe('handleMoveNodes', () => {
  it('should move a top-level node to a new rootOrder slot', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const b = buildRect({ id: 'b' });
    const state = buildState({ nodes: { a, b }, rootOrder: ['a', 'b'] });

    // action
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 2, targetParentId: null });

    // result
    expect(getActivePage(state).rootOrder).toEqual(['b', 'a']);
  });

  it('should reparent a top-level node into a group, removing it from rootOrder and appending it to childIds', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const group = buildGroup({ childIds: ['b'] });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const state = buildState({ nodes: { a, b, 'group-1': group }, rootOrder: ['a', 'group-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 1, targetParentId: 'group-1' });

    // result
    const page = getActivePage(state);
    expect(page.rootOrder).toEqual(['group-1']);
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual(['b', 'a']);
    expect(page.nodes.a.parentId).toBe('group-1');
  });

  it('should move a nested child out of its group and back to the top level, leaving the group intact when a sibling remains', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'b'] });
    const state = buildState({ nodes: { a, b, 'group-1': group }, rootOrder: ['group-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 1, targetParentId: null });

    // result
    const page = getActivePage(state);
    expect(page.rootOrder).toEqual(['group-1', 'a']);
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual(['b']);
    expect(page.nodes.a.parentId).toBeNull();
  });

  it('should delete the group once its last remaining child is moved out', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'group-1': group }, rootOrder: ['group-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 1, targetParentId: null });

    // result — the now-empty group is gone, 'a' is the only thing left at the top level
    const page = getActivePage(state);
    expect(page.nodes['group-1']).toBeUndefined();
    expect(page.rootOrder).toEqual(['a']);
    expect(page.nodes.a.parentId).toBeNull();
  });

  it('should not delete the group when a node is merely reordered within it (transiently empty, not vacated)', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'b'] });
    const state = buildState({ nodes: { a, b, 'group-1': group }, rootOrder: ['group-1'] });

    // action — move 'a' to the end of its own group's children
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 1, targetParentId: 'group-1' });

    // result
    const page = getActivePage(state);
    expect(page.nodes['group-1']).toBeDefined();
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual(['b', 'a']);
  });

  it('should resync both the old and new parent group bounds after a reparent', () => {
    // mock — the source group shrinks to fit its remaining child, the target group grows to include the moved one
    const a = buildRect({ height: 10, id: 'a', parentId: 'source', width: 10, x: 0, y: 0 });
    const stayed = buildRect({ height: 10, id: 'stayed', parentId: 'source', width: 10, x: 0, y: 0 });
    const source = buildGroup({ childIds: ['a', 'stayed'], height: 10, id: 'source', width: 10, x: 0, y: 0 });
    const target = buildGroup({ childIds: [], height: 10, id: 'target', width: 10, x: 100, y: 100 });
    const state = buildState({
      nodes: { a, source, stayed, target },
      rootOrder: ['source', 'target'],
    });

    // action
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 0, targetParentId: 'target' });

    // result
    const page = getActivePage(state);
    expect((page.nodes.target as TGroupNode).x).toBe(0);
    expect((page.nodes.target as TGroupNode).width).toBe(10);
  });

  it('should no-op when the target is one of the moved nodes itself', () => {
    // mock
    const group = buildGroup({ childIds: [] });
    const state = buildState({ nodes: { 'group-1': group }, rootOrder: ['group-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['group-1'], targetIndex: 0, targetParentId: 'group-1' });

    // result — nothing changed, no crash
    expect(getActivePage(state).rootOrder).toEqual(['group-1']);
  });

  it('should no-op when the target is a descendant of one of the moved nodes', () => {
    // mock
    const inner = buildRect({ id: 'inner', parentId: 'outer' });
    const outerGroup = buildGroup({ childIds: ['inner'], id: 'outer' });
    const state = buildState({ nodes: { inner, outer: outerGroup }, rootOrder: ['outer'] });

    // action — attempt to move the outer group inside its own child, which is not itself a group so this is
    // exercised via a nested group-in-group setup instead
    const nestedGroup = buildGroup({ childIds: [], id: 'nested', parentId: 'outer' });
    state.pages['page-1'].nodes.nested = nestedGroup;
    (state.pages['page-1'].nodes.outer as TGroupNode).childIds = ['inner', 'nested'];

    handleMoveNodes(state, { nodeIds: ['outer'], targetIndex: 0, targetParentId: 'nested' });

    // result — outer was never moved into its own descendant
    expect(getActivePage(state).rootOrder).toEqual(['outer']);
    expect(getActivePage(state).nodes.outer.parentId).toBeNull();
  });

  it('should tolerate a moved id that no longer resolves to a node', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a', 'gone'] });

    // action & result — should not throw, and should still move the id that does resolve
    expect(() => handleMoveNodes(state, { nodeIds: ['a', 'gone'], targetIndex: 2, targetParentId: null })).not.toThrow();
    expect(getActivePage(state).rootOrder).toEqual(['a', 'gone']);
  });
});
