// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleToggleNodeLocked } from '../handleToggleNodeLocked';

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
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

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
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

describe('handleToggleNodeLocked', () => {
  it('should lock an unlocked node', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleNodeLocked(state, frame.id);

    // result
    expect(getActivePage(state).nodes[frame.id].locked).toBe(true);
  });

  it('should unlock an already-locked node', () => {
    // mock
    const frame = buildFrame({ locked: true });
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleNodeLocked(state, frame.id);

    // result
    expect(getActivePage(state).nodes[frame.id].locked).toBe(false);
  });

  it('should no-op for an unknown node id', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleNodeLocked(state, 'missing-id');

    // result
    expect(getActivePage(state).nodes[frame.id].locked).toBeUndefined();
  });

  it('should cascade locking to every child of a group, not just the group node itself', () => {
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
    handleToggleNodeLocked(state, 'group-1');

    // result
    expect(getActivePage(state).nodes['group-1'].locked).toBe(true);
    expect(getActivePage(state).nodes.a.locked).toBe(true);
    expect(getActivePage(state).nodes.b.locked).toBe(true);
  });

  it('should cascade unlocking back to every child when toggling an already-locked group again', () => {
    // mock
    const a = buildFrame({ id: 'a', locked: true, parentId: 'group-1' });
    const group: TGroupNode = {
      childIds: ['a'],
      height: 10,
      id: 'group-1',
      locked: true,
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
    handleToggleNodeLocked(state, 'group-1');

    // result
    expect(getActivePage(state).nodes['group-1'].locked).toBe(false);
    expect(getActivePage(state).nodes.a.locked).toBe(false);
  });
});
