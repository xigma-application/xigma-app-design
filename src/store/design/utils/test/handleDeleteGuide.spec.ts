// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleDeleteGuide } from '../handleDeleteGuide';

const frame = (id: string): TFrameNode => ({
  fill: '#ff0000',
  height: 100,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
});

const buildState = (nodes: Record<string, TSceneNode> = {}): TDesignState => ({
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
      guides: [{ axis: 'x', id: 'page-guide', position: 10 }],
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

describe('handleDeleteGuide', () => {
  it('should remove a page guide by id', () => {
    // mock
    const state = buildState();

    // before
    handleDeleteGuide(state, { frameId: null, id: 'page-guide' });

    // result
    expect(getActivePage(state).guides).toEqual([]);
  });

  it("should remove a guide from a frame's own list", () => {
    // mock
    const state = buildState({ frame: { ...frame('frame'), guides: [{ axis: 'y', id: 'frame-guide', position: 5 }] } });

    // before
    handleDeleteGuide(state, { frameId: 'frame', id: 'frame-guide' });

    // result
    const node = getActivePage(state).nodes.frame;

    expect(node.type === NodeType.frame && node.guides).toEqual([]);
  });

  it('should do nothing when the guide id does not exist in the target list', () => {
    // mock
    const state = buildState();

    // before
    handleDeleteGuide(state, { frameId: null, id: 'missing' });

    // result
    expect(getActivePage(state).guides).toEqual([{ axis: 'x', id: 'page-guide', position: 10 }]);
  });

  it('should do nothing when frameId names a node that does not exist', () => {
    // mock
    const state = buildState();

    // before
    handleDeleteGuide(state, { frameId: 'missing', id: 'page-guide' });

    // result
    expect(getActivePage(state).guides).toEqual([{ axis: 'x', id: 'page-guide', position: 10 }]);
  });
});
