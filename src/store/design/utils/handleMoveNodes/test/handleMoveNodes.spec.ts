// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TFrameNode, TGroupNode, TRectangleNode, TSectionNode } from 'types/design/types';

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

const buildFrame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildSection = (overrides: Partial<TSectionNode>): TSectionNode => ({
  childIds: [],
  fill: '#fff',
  height: 10,
  id: 'section-1',
  name: 'Section',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildState = (page: Partial<TDesignPage>): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  commentDraftPosition: null,
  designHintLabelKey: null,
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
  pages: {
    'page-1': {
      backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes: {},
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      ...page,
    },
  },
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
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

  it('should reparent a top-level node into a section, removing it from rootOrder and appending it to childIds', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const section = buildSection({ childIds: ['b'], id: 'section-1' });
    const b = buildRect({ id: 'b', parentId: 'section-1' });
    const state = buildState({ nodes: { a, b, 'section-1': section }, rootOrder: ['a', 'section-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 1, targetParentId: 'section-1' });

    // result
    const page = getActivePage(state);
    expect(page.rootOrder).toEqual(['section-1']);
    expect((page.nodes['section-1'] as TSectionNode).childIds).toEqual(['b', 'a']);
    expect(page.nodes.a.parentId).toBe('section-1');
  });

  it('should not move a section into a frame', () => {
    // mock
    const section = buildSection({ id: 'section-1' });
    const frame = buildFrame({ id: 'frame-1' });
    const state = buildState({ nodes: { 'frame-1': frame, 'section-1': section }, rootOrder: ['frame-1', 'section-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['section-1'], targetIndex: 0, targetParentId: 'frame-1' });

    // result — nothing moved
    const page = getActivePage(state);
    expect(page.rootOrder).toEqual(['frame-1', 'section-1']);
    expect(page.nodes['section-1'].parentId).toBeNull();
    expect((page.nodes['frame-1'] as TFrameNode).childIds).toEqual([]);
  });

  it('should not move a section into another section', () => {
    // mock
    const outer = buildSection({ id: 'outer' });
    const inner = buildSection({ id: 'inner' });
    const state = buildState({ nodes: { inner, outer }, rootOrder: ['outer', 'inner'] });

    // action
    handleMoveNodes(state, { nodeIds: ['inner'], targetIndex: 0, targetParentId: 'outer' });

    // result — nothing moved
    const page = getActivePage(state);
    expect(page.rootOrder).toEqual(['outer', 'inner']);
    expect(page.nodes.inner.parentId).toBeNull();
    expect((page.nodes.outer as TSectionNode).childIds).toEqual([]);
  });

  it('should not move a section into a group', () => {
    // mock
    const group = buildGroup({ id: 'group-1' });
    const section = buildSection({ id: 'section-1' });
    const state = buildState({ nodes: { 'group-1': group, 'section-1': section }, rootOrder: ['group-1', 'section-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['section-1'], targetIndex: 0, targetParentId: 'group-1' });

    // result — nothing moved
    const page = getActivePage(state);
    expect(page.rootOrder).toEqual(['group-1', 'section-1']);
    expect(page.nodes['section-1'].parentId).toBeNull();
  });

  it('should lay out a node reparented into an auto-layout frame alongside its new sibling', () => {
    // mock
    const a = buildRect({ id: 'a', width: 30 });
    const b = buildRect({ id: 'b', parentId: 'frame-1', width: 50 });
    const layoutFrame = buildFrame({ childIds: ['b'], id: 'frame-1', layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame }, rootOrder: ['a', 'frame-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 0, targetParentId: 'frame-1' });

    // result — inserted before 'b', so it takes the frame's own origin and pushes 'b' along
    const page = getActivePage(state);
    expect(page.nodes.a).toMatchObject({ x: 0, y: 0 });
    expect(page.nodes.b).toMatchObject({ x: 30, y: 0 });
  });

  it('should close the gap in the source auto-layout frame after a child is moved out', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'frame-1', width: 30 });
    const b = buildRect({ id: 'b', parentId: 'frame-1', width: 50 });
    const layoutFrame = buildFrame({ childIds: ['a', 'b'], id: 'frame-1', layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame }, rootOrder: ['frame-1'] });

    // action
    handleMoveNodes(state, { nodeIds: ['a'], targetIndex: 1, targetParentId: null });

    // result
    const page = getActivePage(state);
    expect(page.nodes.b).toMatchObject({ x: 0, y: 0 });
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
