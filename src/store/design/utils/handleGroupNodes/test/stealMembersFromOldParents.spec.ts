// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { stealMembersFromOldParents } from '../stealMembersFromOldParents';

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

describe('stealMembersFromOldParents', () => {
  it('should no-op when there is nothing to steal', () => {
    // mock
    const state = buildState({ nodes: {}, rootOrder: [] });

    // action & result — should not throw
    expect(() => stealMembersFromOldParents(state, [], null)).not.toThrow();
  });

  it('should remove a stolen member from the rootOrder when it was top-level', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'] });

    // action
    stealMembersFromOldParents(state, ['a'], 'group-1');

    // result
    expect(getActivePage(state).rootOrder).toEqual([]);
  });

  it('should remove a stolen member from its old group and resync that group when siblings remain', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const stayed = buildRect({ height: 10, id: 'stayed', parentId: 'group-1', width: 10, x: 5, y: 5 });
    const group = buildGroup({ childIds: ['a', 'stayed'], height: 10, width: 10, x: 0, y: 0 });
    const state = buildState({ nodes: { a, 'group-1': group, stayed }, rootOrder: ['group-1'] });

    // action
    stealMembersFromOldParents(state, ['a'], null);

    // result
    const page = getActivePage(state);
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual(['stayed']);
    expect((page.nodes['group-1'] as TGroupNode).x).toBe(5);
  });

  it('should delete the old group entirely once its last remaining child is stolen away', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'group-1': group }, rootOrder: ['group-1'] });

    // action
    stealMembersFromOldParents(state, ['a'], null);

    // result
    expect(getActivePage(state).nodes['group-1']).toBeUndefined();
    expect(getActivePage(state).rootOrder).toEqual([]);
  });

  it('should not resync or delete the old group when its old parent is also the new target parent', () => {
    // mock — a reorder-within-the-same-group scenario, not a real steal
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'group-1': group }, rootOrder: ['group-1'] });

    // action
    stealMembersFromOldParents(state, ['a'], 'group-1');

    // result — 'a' is removed from the container either way, but the (now empty) old group is left
    // alone since it IS the target, not deleted out from under the group about to be built there
    const page = getActivePage(state);
    expect((page.nodes['group-1'] as TGroupNode).childIds).toEqual([]);
    expect(page.nodes['group-1']).toBeDefined();
  });

  it('should batch multiple stolen members from the same old parent into a single removal', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const stayed = buildRect({ id: 'stayed', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'b', 'stayed'] });
    const state = buildState({ nodes: { a, b, 'group-1': group, stayed }, rootOrder: ['group-1'] });

    // action
    stealMembersFromOldParents(state, ['a', 'b'], null);

    // result
    expect((getActivePage(state).nodes['group-1'] as TGroupNode).childIds).toEqual(['stayed']);
  });
});
