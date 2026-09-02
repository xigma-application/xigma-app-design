// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { handleUngroupNodes } from '../handleUngroupNodes';

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

describe('handleUngroupNodes', () => {
  it('should splice a group children back into rootOrder at the group slot and select them', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const other = buildRect({ id: 'other' });
    const group = buildGroup({ childIds: ['a', 'b'] });
    const state = buildState({
      nodes: { a, b, 'group-1': group, other },
      rootOrder: ['other', 'group-1'],
      selectedIds: ['group-1'],
    });

    // action
    handleUngroupNodes(state, ['group-1']);

    // result
    const page = getActivePage(state);
    expect(page.nodes['group-1']).toBeUndefined();
    expect(page.rootOrder).toEqual(['other', 'a', 'b']);
    expect(page.nodes.a.parentId).toBeNull();
    expect(page.nodes.b.parentId).toBeNull();
    expect(page.selectedIds).toEqual(['a', 'b']);
  });

  it('should splice children back into a parent group when the group was nested', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'inner' });
    const inner = buildGroup({ childIds: ['a'], id: 'inner', parentId: 'outer' });
    const outer = buildGroup({ childIds: ['inner'], id: 'outer' });
    const state = buildState({
      nodes: { a, inner, outer },
      rootOrder: ['outer'],
      selectedIds: ['inner'],
    });

    // action
    handleUngroupNodes(state, ['inner']);

    // result
    const page = getActivePage(state);
    expect((page.nodes.outer as TGroupNode).childIds).toEqual(['a']);
    expect(page.nodes.a.parentId).toBe('outer');
  });

  it('should tolerate a group whose child id no longer resolves', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const group = buildGroup({ childIds: ['a', 'gone'] });
    const state = buildState({ nodes: { a, 'group-1': group }, rootOrder: ['group-1'], selectedIds: ['group-1'] });

    // action
    handleUngroupNodes(state, ['group-1']);

    // result
    expect(getActivePage(state).rootOrder).toEqual(['a', 'gone']);
    expect(getActivePage(state).nodes.a.parentId).toBeNull();
  });

  it('should ignore ids that are not groups', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'], selectedIds: ['a'] });

    // action
    handleUngroupNodes(state, ['a', 'missing']);

    // result
    expect(getActivePage(state).nodes.a).toBeDefined();
    expect(getActivePage(state).selectedIds).toEqual(['a']);
  });
});
