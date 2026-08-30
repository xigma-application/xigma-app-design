// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { syncGroupBounds } from '../syncGroupBounds';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id: 'r',
  name: 'Rectangle',
  parentId: 'group-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const group = (overrides: Partial<TGroupNode>): TGroupNode => ({
  childIds: [],
  height: 0,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 0,
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

describe('syncGroupBounds', () => {
  it('should recompute the group box from its children and bubble up to ancestor groups', () => {
    // mock
    const a = rect({ id: 'a', parentId: 'inner', x: 0, y: 0, width: 20, height: 20 });
    const b = rect({ id: 'b', parentId: 'inner', x: 60, y: 40, width: 10, height: 10 });
    const inner = group({ id: 'inner', childIds: ['a', 'b'], parentId: 'outer' });
    const outer = group({ id: 'outer', childIds: ['inner'] });
    const state = buildState({ nodes: { outer, inner, a, b } });

    // action
    syncGroupBounds(state, 'inner');

    // result
    expect(getActivePage(state).nodes.inner).toMatchObject({ x: 0, y: 0, width: 70, height: 50 });
    expect(getActivePage(state).nodes.outer).toMatchObject({ x: 0, y: 0, width: 70, height: 50 });
  });

  it('should no-op for a null id', () => {
    // mock
    const state = buildState({ nodes: {} });

    // action / result
    expect(() => syncGroupBounds(state, null)).not.toThrow();
  });

  it('should no-op when the id is not a group', () => {
    // mock
    const a = rect({ id: 'a', parentId: null });
    const state = buildState({ nodes: { a } });

    // action
    syncGroupBounds(state, 'a');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ width: 10, height: 10 });
  });

  it('should recompute a rotated group box in its own local (unrotated) frame via getRotatedGroupBounds', () => {
    // mock — a single 20x20 child at the origin, group rotated 90deg: getRotatedGroupBounds keeps
    // the group's own local footprint equal to the child's unrotated bounds (20x20), just re-anchored
    // so the ROTATED shape still world-encloses that child — this is the behavior resyncRotatedGroupBounds
    // already relies on for the drag-a-child-within-a-rotated-group case; syncGroupBounds must agree
    // with it for the structural add/remove-child case (grouping, moveNodes, ungroup)
    const a = rect({ id: 'a', parentId: 'group-1', x: 0, y: 0, width: 20, height: 20 });
    const rotatedGroup = group({ childIds: ['a'], rotation: 90, x: 5, y: 5, width: 5, height: 5 });
    const state = buildState({ nodes: { 'group-1': rotatedGroup, a } });

    // action
    syncGroupBounds(state, 'group-1');

    // result — no longer frozen at its stale 5x5 box; recomputed to actually enclose the child
    const updated = getActivePage(state).nodes['group-1'];
    expect(updated).toMatchObject({ height: 20, width: 20 });
    expect(updated).not.toMatchObject({ height: 5, width: 5 });
  });

  it('should leave the box untouched when the group has no resolvable children', () => {
    // mock
    const emptyGroup = group({ childIds: ['gone'], width: 5, height: 5 });
    const state = buildState({ nodes: { 'group-1': emptyGroup } });

    // action
    syncGroupBounds(state, 'group-1');

    // result
    expect(getActivePage(state).nodes['group-1']).toMatchObject({ width: 5, height: 5 });
  });
});
