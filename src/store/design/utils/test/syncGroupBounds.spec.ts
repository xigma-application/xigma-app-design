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

describe('syncGroupBounds', () => {
  it('should recompute the group box from its children and bubble up to ancestor groups', () => {
    // mock
    const a = rect({ height: 20, id: 'a', parentId: 'inner', width: 20, x: 0, y: 0 });
    const b = rect({ height: 10, id: 'b', parentId: 'inner', width: 10, x: 60, y: 40 });
    const inner = group({ childIds: ['a', 'b'], id: 'inner', parentId: 'outer' });
    const outer = group({ childIds: ['inner'], id: 'outer' });
    const state = buildState({ nodes: { a, b, inner, outer } });

    // action
    syncGroupBounds(state, 'inner');

    // result
    expect(getActivePage(state).nodes.inner).toMatchObject({ height: 50, width: 70, x: 0, y: 0 });
    expect(getActivePage(state).nodes.outer).toMatchObject({ height: 50, width: 70, x: 0, y: 0 });
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
    expect(getActivePage(state).nodes.a).toMatchObject({ height: 10, width: 10 });
  });

  it('should recompute a rotated group box in its own local (unrotated) frame via getRotatedGroupBounds', () => {
    // mock — a single 20x20 child at the origin, group rotated 90deg: getRotatedGroupBounds keeps
    // the group's own local footprint equal to the child's unrotated bounds (20x20), just re-anchored
    // so the ROTATED shape still world-encloses that child — this is the behavior resyncRotatedGroupBounds
    // already relies on for the drag-a-child-within-a-rotated-group case; syncGroupBounds must agree
    // with it for the structural add/remove-child case (grouping, moveNodes, ungroup)
    const a = rect({ height: 20, id: 'a', parentId: 'group-1', width: 20, x: 0, y: 0 });
    const rotatedGroup = group({ childIds: ['a'], height: 5, rotation: 90, width: 5, x: 5, y: 5 });
    const state = buildState({ nodes: { a, 'group-1': rotatedGroup } });

    // action
    syncGroupBounds(state, 'group-1');

    // result — no longer frozen at its stale 5x5 box; recomputed to actually enclose the child
    const updated = getActivePage(state).nodes['group-1'];
    expect(updated).toMatchObject({ height: 20, width: 20 });
    expect(updated).not.toMatchObject({ height: 5, width: 5 });
  });

  it('should leave the box untouched when the group has no resolvable children', () => {
    // mock
    const emptyGroup = group({ childIds: ['gone'], height: 5, width: 5 });
    const state = buildState({ nodes: { 'group-1': emptyGroup } });

    // action
    syncGroupBounds(state, 'group-1');

    // result
    expect(getActivePage(state).nodes['group-1']).toMatchObject({ height: 5, width: 5 });
  });
});
