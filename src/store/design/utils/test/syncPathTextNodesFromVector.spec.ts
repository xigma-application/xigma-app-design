// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TTextNode, TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { syncPathTextNodesFromVector } from '../syncPathTextNodesFromVector';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: seg('s1', 'a', 'b') },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
  ...overrides,
});

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 999,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'vector-1',
  pathStartOffset: 0,
  rotation: 999,
  type: NodeType.text,
  width: 999,
  x: 999,
  y: 999,
  ...overrides,
});

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

describe('syncPathTextNodesFromVector', () => {
  it("should copy the vector's computed bounds onto every text node bound to it as a text path, forcing rotation to 0", () => {
    // mock — a(0,0)->b(100,0)
    const vectorNode = buildVectorNode();
    const textNode = buildPathText();
    const state = buildState({ [textNode.id]: textNode, [vectorNode.id]: vectorNode });

    // before
    syncPathTextNodesFromVector(state, vectorNode);

    // result
    expect(getActivePage(state).nodes[textNode.id]).toMatchObject({ height: 0, rotation: 0, width: 100, x: 0, y: 0 });
  });

  it('should leave content/font/pathStartOffset/pathFlip untouched', () => {
    // mock
    const vectorNode = buildVectorNode();
    const textNode = buildPathText({ content: 'Hello', fontSize: 32, pathFlip: true, pathStartOffset: 0.4 });
    const state = buildState({ [textNode.id]: textNode, [vectorNode.id]: vectorNode });

    // before
    syncPathTextNodesFromVector(state, vectorNode);

    // result
    expect(getActivePage(state).nodes[textNode.id]).toMatchObject({
      content: 'Hello',
      fontSize: 32,
      pathFlip: true,
      pathStartOffset: 0.4,
    });
  });

  it('should sync every text node bound to the same vector', () => {
    // mock
    const vectorNode = buildVectorNode();
    const first = buildPathText({ id: 'text-1' });
    const second = buildPathText({ id: 'text-2' });
    const state = buildState({ [first.id]: first, [second.id]: second, [vectorNode.id]: vectorNode });

    // before
    syncPathTextNodesFromVector(state, vectorNode);

    // result
    expect(getActivePage(state).nodes[first.id]).toMatchObject({ height: 0, width: 100 });
    expect(getActivePage(state).nodes[second.id]).toMatchObject({ height: 0, width: 100 });
  });

  it('should leave text nodes bound to a different vector untouched', () => {
    // mock
    const vectorNode = buildVectorNode();
    const unrelated = buildPathText({ height: 50, id: 'text-2', pathId: 'vector-2', width: 50, x: 5, y: 5 });
    const state = buildState({ [unrelated.id]: unrelated, [vectorNode.id]: vectorNode });

    // before
    syncPathTextNodesFromVector(state, vectorNode);

    // result
    expect(getActivePage(state).nodes[unrelated.id]).toMatchObject({ height: 50, width: 50, x: 5, y: 5 });
  });

  it('should be a no-op (and skip the bounds computation) when no text node is bound to the vector', () => {
    // mock
    const vectorNode = buildVectorNode();
    const state = buildState({ [vectorNode.id]: vectorNode });

    // result — nothing throws, no nodes to assert on beyond the vector itself
    expect(() => syncPathTextNodesFromVector(state, vectorNode)).not.toThrow();
  });
});
