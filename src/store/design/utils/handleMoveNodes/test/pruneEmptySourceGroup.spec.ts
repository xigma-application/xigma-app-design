// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { pruneEmptySourceGroup } from '../pruneEmptySourceGroup';

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

describe('pruneEmptySourceGroup', () => {
  it('should no-op when sourceParentId is null', () => {
    // mock
    const state = buildState({});

    // action & result — should not throw
    expect(() => pruneEmptySourceGroup(state, null, null)).not.toThrow();
  });

  it('should no-op when the source and target parent are the same (a reorder within the same group)', () => {
    // mock
    const group = buildGroup({ childIds: [] });
    const state = buildState({ nodes: { 'group-1': group }, rootOrder: ['group-1'] });

    // action
    pruneEmptySourceGroup(state, 'group-1', 'group-1');

    // result — untouched
    expect(getActivePage(state).nodes['group-1']).toBeDefined();
  });

  it('should delete the source group once it has been vacated', () => {
    // mock
    const group = buildGroup({ childIds: [] });
    const state = buildState({ nodes: { 'group-1': group }, rootOrder: ['group-1'] });

    // action
    pruneEmptySourceGroup(state, 'group-1', null);

    // result
    expect(getActivePage(state).nodes['group-1']).toBeUndefined();
    expect(getActivePage(state).rootOrder).toEqual([]);
  });

  it('should resync bounds instead of deleting when the source group still has children left', () => {
    // mock
    const stayed = buildRect({ height: 10, id: 'stayed', parentId: 'group-1', width: 10, x: 5, y: 5 });
    const group = buildGroup({ childIds: ['stayed'], height: 10, width: 10, x: 0, y: 0 });
    const state = buildState({ nodes: { 'group-1': group, stayed }, rootOrder: ['group-1'] });

    // action
    pruneEmptySourceGroup(state, 'group-1', null);

    // result — the group is still there, resynced to its one remaining child's bounds
    const resyncedGroup = getActivePage(state).nodes['group-1'] as TGroupNode;
    expect(resyncedGroup).toBeDefined();
    expect(resyncedGroup.x).toBe(5);
  });

  it('should no-op when the source parent id does not resolve to a group', () => {
    // mock
    const state = buildState({ nodes: {}, rootOrder: [] });

    // action & result — should not throw
    expect(() => pruneEmptySourceGroup(state, 'missing', null)).not.toThrow();
  });
});
