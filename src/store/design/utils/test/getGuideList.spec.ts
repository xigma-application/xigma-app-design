// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGuideList } from '../getGuideList';

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

describe('getGuideList', () => {
  it('should return the active page guides when frameId is null', () => {
    // mock
    const state = buildState();

    // result
    expect(getGuideList(state, null)).toEqual([{ axis: 'x', id: 'page-guide', position: 10 }]);
  });

  it("should return a frame's own guide list", () => {
    // mock
    const state = buildState({ frame: { ...frame('frame'), guides: [{ axis: 'y', id: 'frame-guide', position: 5 }] } });

    // result
    expect(getGuideList(state, 'frame')).toEqual([{ axis: 'y', id: 'frame-guide', position: 5 }]);
  });

  it('should return undefined for a frame that has no guides yet', () => {
    // mock
    const state = buildState({ frame: frame('frame') });

    // result
    expect(getGuideList(state, 'frame')).toBeUndefined();
  });

  it('should return undefined when frameId names a non-frame node', () => {
    // mock
    const rectangle: TSceneNode = { ...frame('rect'), type: NodeType.rectangle };
    const state = buildState({ rect: rectangle });

    // result
    expect(getGuideList(state, 'rect')).toBeUndefined();
  });

  it('should return undefined when frameId names a node that does not exist', () => {
    // mock
    const state = buildState();

    // result
    expect(getGuideList(state, 'missing')).toBeUndefined();
  });
});
