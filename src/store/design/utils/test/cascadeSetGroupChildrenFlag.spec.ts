// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { cascadeSetGroupChildrenFlag } from '../cascadeSetGroupChildrenFlag';
import { getActivePage } from '../getActivePage';

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

const buildGroup = (overrides: Partial<TGroupNode> = {}): TGroupNode => ({
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

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
  activePageId: 'page-1',
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
  pages: {
    'page-1': {
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes,
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: Object.keys(nodes),
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('cascadeSetGroupChildrenFlag', () => {
  it('should no-op for a non-group node', () => {
    // mock
    const rect = buildRect();
    const state = buildState({ [rect.id]: rect });

    // action
    cascadeSetGroupChildrenFlag(state, rect, 'hidden', true);

    // result
    expect(getActivePage(state).nodes[rect.id].hidden).toBeUndefined();
  });

  it("should set the flag on every one of a group's direct children", () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'b'] });
    const state = buildState({ a, b, 'group-1': group });

    // action
    cascadeSetGroupChildrenFlag(state, group, 'hidden', true);

    // result
    expect(getActivePage(state).nodes.a.hidden).toBe(true);
    expect(getActivePage(state).nodes.b.hidden).toBe(true);
  });

  it('should recurse into nested groups, setting the flag arbitrarily deep', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'inner' });
    const inner = buildGroup({ childIds: ['a'], id: 'inner', parentId: 'outer' });
    const outer = buildGroup({ childIds: ['inner'], id: 'outer' });
    const state = buildState({ a, inner, outer });

    // action
    cascadeSetGroupChildrenFlag(state, outer, 'locked', true);

    // result — both the nested group itself and its own leaf child are updated
    expect(getActivePage(state).nodes.inner.locked).toBe(true);
    expect(getActivePage(state).nodes.a.locked).toBe(true);
  });

  it('should be able to clear the flag back to false, not just set it', () => {
    // mock
    const a = buildRect({ hidden: true, id: 'a', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a'] });
    const state = buildState({ a, 'group-1': group });

    // action
    cascadeSetGroupChildrenFlag(state, group, 'hidden', false);

    // result
    expect(getActivePage(state).nodes.a.hidden).toBe(false);
  });

  it('should tolerate a childId that no longer resolves to a node', () => {
    // mock
    const group = buildGroup({ childIds: ['gone'] });
    const state = buildState({ 'group-1': group });

    // action & result — should not throw
    expect(() => cascadeSetGroupChildrenFlag(state, group, 'hidden', true)).not.toThrow();
  });
});
