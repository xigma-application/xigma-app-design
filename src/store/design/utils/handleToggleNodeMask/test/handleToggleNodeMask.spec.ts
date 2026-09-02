// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { handleToggleNodeMask } from '../handleToggleNodeMask';

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

const buildRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
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

describe('handleToggleNodeMask', () => {
  it('should flag a plain node as a mask', () => {
    // mock
    const rect = buildRectangle();
    const state = buildState({ [rect.id]: rect });

    // before
    handleToggleNodeMask(state, rect.id);

    // result
    expect(getActivePage(state).nodes[rect.id].isMask).toBe(true);
  });

  it('should clear the flag on an already-masking node', () => {
    // mock
    const rect = buildRectangle({ isMask: true });
    const state = buildState({ [rect.id]: rect });

    // before
    handleToggleNodeMask(state, rect.id);

    // result
    expect(getActivePage(state).nodes[rect.id].isMask).toBe(false);
  });

  it('should no-op for an unknown node id', () => {
    // mock
    const rect = buildRectangle();
    const state = buildState({ [rect.id]: rect });

    // before
    handleToggleNodeMask(state, 'missing-id');

    // result
    expect(getActivePage(state).nodes[rect.id].isMask).toBeUndefined();
  });
});
