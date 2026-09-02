// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleToggleNodeHidden } from '../handleToggleNodeHidden';

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
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
      id: 'page-1',
      name: 'Page 1',
      nodes,
      paintColor: '#d9d9d9',
      rootOrder: Object.keys(nodes),
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  fill: '#ff0000',
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

describe('handleToggleNodeHidden', () => {
  it('should hide a visible node', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleNodeHidden(state, frame.id);

    // result
    expect(getActivePage(state).nodes[frame.id].hidden).toBe(true);
  });

  it('should show an already-hidden node', () => {
    // mock
    const frame = buildFrame({ hidden: true });
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleNodeHidden(state, frame.id);

    // result
    expect(getActivePage(state).nodes[frame.id].hidden).toBe(false);
  });

  it('should no-op for an unknown node id', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleNodeHidden(state, 'missing-id');

    // result
    expect(getActivePage(state).nodes[frame.id].hidden).toBeUndefined();
  });

  it('should cascade hiding to every child of a group, not just the group node itself', () => {
    // mock
    const a = buildFrame({ id: 'a', parentId: 'group-1' });
    const b = buildFrame({ id: 'b', parentId: 'group-1' });
    const group: TGroupNode = {
      childIds: ['a', 'b'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({ a, b, 'group-1': group });

    // before
    handleToggleNodeHidden(state, 'group-1');

    // result
    expect(getActivePage(state).nodes['group-1'].hidden).toBe(true);
    expect(getActivePage(state).nodes.a.hidden).toBe(true);
    expect(getActivePage(state).nodes.b.hidden).toBe(true);
  });

  it('should cascade un-hiding back to every child when toggling an already-hidden group again', () => {
    // mock
    const a = buildFrame({ hidden: true, id: 'a', parentId: 'group-1' });
    const group: TGroupNode = {
      childIds: ['a'],
      height: 10,
      hidden: true,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({ a, 'group-1': group });

    // before
    handleToggleNodeHidden(state, 'group-1');

    // result
    expect(getActivePage(state).nodes['group-1'].hidden).toBe(false);
    expect(getActivePage(state).nodes.a.hidden).toBe(false);
  });
});
