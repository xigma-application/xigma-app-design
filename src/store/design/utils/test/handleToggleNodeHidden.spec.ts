// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TFrameNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleToggleNodeHidden } from '../handleToggleNodeHidden';

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
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
});
