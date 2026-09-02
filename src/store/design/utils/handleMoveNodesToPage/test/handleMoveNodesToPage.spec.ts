// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { handleMoveNodesToPage } from '../handleMoveNodesToPage';

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

const buildPage = (id: string, overrides: Partial<TDesignPage> = {}): TDesignPage => ({
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

const buildState = (source: Partial<TDesignPage>, target: Partial<TDesignPage> = {}): TDesignState => ({
  activePageId: 'source',
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
    source: buildPage('source', source),
    target: buildPage('target', target),
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('handleMoveNodesToPage', () => {
  it('should relocate a top-level node from the source page to the target page', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'], selectedIds: ['a'] });

    // action
    handleMoveNodesToPage(state, { nodeIds: ['a'], targetPageId: 'target' });

    // result — the low-level relocation itself is relocateNodeSubtree's own concern (see its spec);
    // this just confirms the orchestrator actually delegates to it
    expect(state.pages.source.nodes.a).toBeUndefined();
    expect(state.pages.target.nodes.a).toEqual(a);
  });

  it('should clear the moved id out of the source page’s selection', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const b = buildRect({ id: 'b' });
    const state = buildState({ nodes: { a, b }, rootOrder: ['a', 'b'], selectedIds: ['a', 'b'] });

    // action
    handleMoveNodesToPage(state, { nodeIds: ['a'], targetPageId: 'target' });

    // result — 'a' is gone from the selection, 'b' (never moved) stays selected
    expect(state.pages.source.selectedIds).toEqual(['b']);
  });

  it('should detach a moved child from its group, leaving the group intact when a sibling remains', () => {
    // mock
    const group = buildGroup({ childIds: ['a', 'b'], id: 'group-1' });
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const state = buildState({ nodes: { a, b, 'group-1': group }, rootOrder: ['group-1'] });

    // action
    handleMoveNodesToPage(state, { nodeIds: ['a'], targetPageId: 'target' });

    // result
    expect((state.pages.source.nodes['group-1'] as TGroupNode).childIds).toEqual(['b']);
  });

  it('should delete the group once its last remaining child is moved away', () => {
    // mock
    const group = buildGroup({ childIds: ['a'], id: 'group-1' });
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const state = buildState({ nodes: { a, 'group-1': group }, rootOrder: ['group-1'] });

    // action
    handleMoveNodesToPage(state, { nodeIds: ['a'], targetPageId: 'target' });

    // result — the now-empty group is gone from the source page
    expect(state.pages.source.nodes['group-1']).toBeUndefined();
    expect(state.pages.source.rootOrder).toEqual([]);
  });

  it('should tolerate a moved id that no longer resolves to a node', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a', 'gone'] });

    // action & result — should not throw, and should still move the id that does resolve
    expect(() => handleMoveNodesToPage(state, { nodeIds: ['a', 'gone'], targetPageId: 'target' })).not.toThrow();
    expect(state.pages.target.rootOrder).toEqual(['a']);
  });

  it('should not duplicate a node selected alongside its own ancestor group', () => {
    // mock — both the group and one of its own children are in nodeIds, group listed first
    const group = buildGroup({ childIds: ['a'], id: 'group-1' });
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const state = buildState({ nodes: { a, 'group-1': group }, rootOrder: ['group-1'] });

    // action
    handleMoveNodesToPage(state, { nodeIds: ['group-1', 'a'], targetPageId: 'target' });

    // result — 'a' was already relocated as part of the group's subtree; the second, redundant pass
    // over 'a' is a no-op rather than re-adding a stale duplicate
    expect(state.pages.target.rootOrder).toEqual(['group-1']);
    expect(Object.keys(state.pages.target.nodes)).toEqual(['group-1', 'a']);
  });

  it('should no-op when the target page does not exist', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'] });

    // action
    handleMoveNodesToPage(state, { nodeIds: ['a'], targetPageId: 'missing' });

    // result — nothing moved
    expect(state.pages.source.nodes.a).toEqual(a);
    expect(state.pages.source.rootOrder).toEqual(['a']);
  });

  it('should no-op when the target page is the active page itself', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'] });

    // action
    handleMoveNodesToPage(state, { nodeIds: ['a'], targetPageId: 'source' });

    // result
    expect(state.pages.source.nodes.a).toEqual(a);
    expect(state.pages.source.rootOrder).toEqual(['a']);
  });
});
