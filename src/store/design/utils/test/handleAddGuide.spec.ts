// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleAddGuide } from '../handleAddGuide';

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

describe('handleAddGuide', () => {
  it('should push a page guide when frameId is null', () => {
    // mock
    const state = buildState();

    // before
    handleAddGuide(state, { axis: 'x', frameId: null, id: 'guide-1', position: 120 });

    // result
    expect(getActivePage(state).guides).toEqual([{ axis: 'x', id: 'guide-1', position: 120 }]);
  });

  it("should push onto a frame's existing guide list", () => {
    // mock
    const state = buildState({ frame: { ...frame('frame'), guides: [{ axis: 'y', id: 'existing', position: 10 }] } });

    // before
    handleAddGuide(state, { axis: 'y', frameId: 'frame', id: 'guide-2', position: 40 });

    // result
    const node = getActivePage(state).nodes.frame;

    expect(node.type === NodeType.frame && node.guides).toEqual([
      { axis: 'y', id: 'existing', position: 10 },
      { axis: 'y', id: 'guide-2', position: 40 },
    ]);
  });

  it('should lazily create the guide list on a frame that has none yet', () => {
    // mock
    const state = buildState({ frame: frame('frame') });

    // before
    handleAddGuide(state, { axis: 'x', frameId: 'frame', id: 'guide-1', position: 5 });

    // result
    const node = getActivePage(state).nodes.frame;

    expect(node.type === NodeType.frame && node.guides).toEqual([{ axis: 'x', id: 'guide-1', position: 5 }]);
  });

  it('should do nothing when frameId names a non-frame node', () => {
    // mock
    const rectangle: TSceneNode = { ...frame('rect'), type: NodeType.rectangle };
    const state = buildState({ rect: rectangle });

    // before
    handleAddGuide(state, { axis: 'x', frameId: 'rect', id: 'guide-1', position: 5 });

    // result
    expect(getActivePage(state).guides).toEqual([]);
  });

  it('should do nothing when frameId names a node that does not exist', () => {
    // mock
    const state = buildState();

    // before
    handleAddGuide(state, { axis: 'x', frameId: 'missing', id: 'guide-1', position: 5 });

    // result
    expect(getActivePage(state).guides).toEqual([]);
  });
});
