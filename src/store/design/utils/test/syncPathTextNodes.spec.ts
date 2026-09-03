// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TPathNode, TTextNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { syncPathTextNodes } from '../syncPathTextNodes';

const buildPathNode = (overrides: Partial<TPathNode> = {}): TPathNode => ({
  height: 200,
  id: 'path-1',
  name: 'Path',
  parentId: null,
  pathType: PathType.ellipse,
  rotation: 0,
  type: NodeType.path,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'path-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
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

describe('syncPathTextNodes', () => {
  it("should copy the path node's box onto every text node bound to it", () => {
    // mock
    const pathNode = buildPathNode({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    syncPathTextNodes(state, pathNode);

    // result
    expect(getActivePage(state).nodes[textNode.id]).toMatchObject({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
  });

  it('should sync every text node bound to the same path', () => {
    // mock
    const pathNode = buildPathNode({ height: 300, width: 300, x: 10, y: 20 });
    const first = buildPathText({ id: 'text-1' });
    const second = buildPathText({ id: 'text-2' });
    const state = buildState({ [pathNode.id]: pathNode, [first.id]: first, [second.id]: second });

    // before
    syncPathTextNodes(state, pathNode);

    // result
    expect(getActivePage(state).nodes[first.id]).toMatchObject({ height: 300, width: 300, x: 10, y: 20 });
    expect(getActivePage(state).nodes[second.id]).toMatchObject({ height: 300, width: 300, x: 10, y: 20 });
  });

  it('should leave text nodes bound to a different path untouched', () => {
    // mock
    const pathNode = buildPathNode({ height: 300, width: 300, x: 10, y: 20 });
    const unrelated = buildPathText({ height: 50, id: 'text-2', pathId: 'path-2', width: 50, x: 0, y: 0 });
    const state = buildState({ [pathNode.id]: pathNode, [unrelated.id]: unrelated });

    // before
    syncPathTextNodes(state, pathNode);

    // result
    expect(getActivePage(state).nodes[unrelated.id]).toMatchObject({ height: 50, width: 50, x: 0, y: 0 });
  });

  it('should leave ordinary (non-path) text nodes untouched', () => {
    // mock
    const pathNode = buildPathNode({ height: 300, width: 300, x: 10, y: 20 });
    const straight = buildPathText({ height: 50, id: 'text-2', pathId: null, width: 50, x: 0, y: 0 });
    const state = buildState({ [pathNode.id]: pathNode, [straight.id]: straight });

    // before
    syncPathTextNodes(state, pathNode);

    // result
    expect(getActivePage(state).nodes[straight.id]).toMatchObject({ height: 50, width: 50, x: 0, y: 0 });
  });
});
