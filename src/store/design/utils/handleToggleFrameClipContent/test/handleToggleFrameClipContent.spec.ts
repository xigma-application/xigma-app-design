// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { handleToggleFrameClipContent } from '../handleToggleFrameClipContent';

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  areAdditionalLabelsVisible: true,
  areRulersVisible: false,
  commentDraftPosition: null,
  designHintLabelKey: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isActionsPanelOpen: false,
  isMediaToolArmed: false,
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

describe('handleToggleFrameClipContent', () => {
  it('should turn Clip content off on a frame that has it on', () => {
    // mock
    const frame = buildFrame({ clipContent: true });
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleFrameClipContent(state, frame.id);

    // result
    expect(getActivePage(state).nodes[frame.id]).toMatchObject({ clipContent: false });
  });

  it('should turn Clip content on on a frame that has it off', () => {
    // mock
    const frame = buildFrame({ clipContent: false });
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleFrameClipContent(state, frame.id);

    // result
    expect(getActivePage(state).nodes[frame.id]).toMatchObject({ clipContent: true });
  });

  it('should no-op for a non-frame node', () => {
    // mock
    const rect = buildRectangle();
    const state = buildState({ [rect.id]: rect });

    // before
    handleToggleFrameClipContent(state, rect.id);

    // result
    expect(getActivePage(state).nodes[rect.id]).toEqual(rect);
  });

  it('should no-op for an unknown node id', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame });

    // before
    handleToggleFrameClipContent(state, 'missing-id');

    // result
    expect(getActivePage(state).nodes[frame.id]).toEqual(frame);
  });
});
