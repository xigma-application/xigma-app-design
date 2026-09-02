// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleUpdateGuide } from '../handleUpdateGuide';

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

describe('handleUpdateGuide', () => {
  it('should move a page guide to its new position', () => {
    // mock
    const state = buildState();

    // before
    handleUpdateGuide(state, { frameId: null, id: 'page-guide', position: 250 });

    // result
    expect(getActivePage(state).guides).toEqual([{ axis: 'x', id: 'page-guide', position: 250 }]);
  });

  it("should move a frame guide to its new position within the frame's own list", () => {
    // mock
    const state = buildState({ frame: { ...frame('frame'), guides: [{ axis: 'y', id: 'frame-guide', position: 5 }] } });

    // before
    handleUpdateGuide(state, { frameId: 'frame', id: 'frame-guide', position: 30 });

    // result
    const node = getActivePage(state).nodes.frame;

    expect(node.type === NodeType.frame && node.guides).toEqual([{ axis: 'y', id: 'frame-guide', position: 30 }]);
  });

  it('should do nothing when the guide id does not exist in the target list', () => {
    // mock
    const state = buildState();

    // before
    handleUpdateGuide(state, { frameId: null, id: 'missing', position: 250 });

    // result
    expect(getActivePage(state).guides).toEqual([{ axis: 'x', id: 'page-guide', position: 10 }]);
  });

  it('should do nothing when frameId names a node that does not exist', () => {
    // mock
    const state = buildState();

    // before
    handleUpdateGuide(state, { frameId: 'missing', id: 'page-guide', position: 250 });

    // result
    expect(getActivePage(state).guides).toEqual([{ axis: 'x', id: 'page-guide', position: 10 }]);
  });
});
