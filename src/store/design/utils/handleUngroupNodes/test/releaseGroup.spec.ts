// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { releaseGroup } from '../releaseGroup';

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
  vectorEditingNodeIds: [],
});

describe('releaseGroup', () => {
  it('should splice the group children into rootOrder at the group slot and clear their parentId', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const other = buildRect({ id: 'other' });
    const group = buildGroup({ childIds: ['a', 'b'] });
    const state = buildState({
      nodes: { a, b, 'group-1': group, other },
      rootOrder: ['other', 'group-1'],
    });

    // action
    const releasedIds = releaseGroup(state, group);

    // result
    const page = getActivePage(state);
    expect(page.nodes['group-1']).toBeUndefined();
    expect(page.rootOrder).toEqual(['other', 'a', 'b']);
    expect(page.nodes.a.parentId).toBeNull();
    expect(page.nodes.b.parentId).toBeNull();
    expect(releasedIds).toEqual(['a', 'b']);
  });

  it('should splice the children into the parent group when the group was nested, reparenting them to it', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'inner' });
    const inner = buildGroup({ childIds: ['a'], id: 'inner', parentId: 'outer' });
    const outer = buildGroup({ childIds: ['inner'], id: 'outer' });
    const state = buildState({ nodes: { a, inner, outer }, rootOrder: ['outer'] });

    // action
    releaseGroup(state, inner);

    // result
    const page = getActivePage(state);
    expect((page.nodes.outer as TGroupNode).childIds).toEqual(['a']);
    expect(page.nodes.a.parentId).toBe('outer');
  });

  it('should skip reparenting a child id that no longer resolves to a node, without throwing', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'gone'] });
    const state = buildState({ nodes: { a, 'group-1': group }, rootOrder: ['group-1'] });

    // action
    const releasedIds = releaseGroup(state, group);

    // result
    const page = getActivePage(state);
    expect(page.rootOrder).toEqual(['a', 'gone']);
    expect(page.nodes.a.parentId).toBeNull();
    expect(releasedIds).toEqual(['a', 'gone']);
  });

  it('should resync the released parent group’s bounds to its remaining children', () => {
    // mock
    const a = buildRect({ height: 20, id: 'a', parentId: 'inner', width: 20, x: 0, y: 0 });
    const inner = buildGroup({ childIds: ['a'], height: 20, id: 'inner', parentId: 'outer', width: 20, x: 0, y: 0 });
    const outer = buildGroup({ childIds: ['inner'], height: 20, id: 'outer', width: 20, x: 0, y: 0 });
    const state = buildState({ nodes: { a, inner, outer }, rootOrder: ['outer'] });

    // action
    releaseGroup(state, inner);

    // result — outer's bounds are recomputed from its now-direct child 'a'
    expect(getActivePage(state).nodes.outer).toMatchObject({ height: 20, width: 20, x: 0, y: 0 });
  });
});
