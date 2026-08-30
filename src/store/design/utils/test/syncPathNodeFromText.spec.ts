// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TPathNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { syncPathNodeFromText } from '../syncPathNodeFromText';

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

describe('syncPathNodeFromText', () => {
  it("should copy the resized/rotated text node's box onto its source path node", () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    syncPathNodeFromText(state, textNode, { height: 200, rotation: 0, width: 200, x: 0, y: 0 });

    // result
    expect(getActivePage(state).nodes[pathNode.id]).toMatchObject({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
  });

  it('should propagate the change to sibling text nodes bound to the same path', () => {
    // mock
    const pathNode = buildPathNode();
    const resized = buildPathText({ height: 300, id: 'text-1', width: 300, x: 10, y: 20 });
    const sibling = buildPathText({ id: 'text-2' });
    const state = buildState({ [pathNode.id]: pathNode, [resized.id]: resized, [sibling.id]: sibling });

    // before
    syncPathNodeFromText(state, resized, { height: 200, rotation: 0, width: 200, x: 0, y: 0 });

    // result
    expect(getActivePage(state).nodes[sibling.id]).toMatchObject({ height: 300, width: 300, x: 10, y: 20 });
  });

  it('should do nothing when the text node has no path binding', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText({ height: 300, pathId: null, width: 300 });
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    syncPathNodeFromText(state, textNode, { height: 200, rotation: 0, width: 200, x: 0, y: 0 });

    // result
    expect(getActivePage(state).nodes[pathNode.id]).toMatchObject({ height: 200, width: 200 });
  });

  it('should do nothing when the referenced node is not a path node', () => {
    // mock
    const textNode = buildPathText({ height: 300, pathId: 'missing', width: 300 });
    const state = buildState({ [textNode.id]: textNode });

    // before
    syncPathNodeFromText(state, textNode, { height: 200, rotation: 0, width: 200, x: 0, y: 0 });

    // result
    expect(getActivePage(state).nodes).toEqual({ [textNode.id]: textNode });
  });

  describe('vector path node', () => {
    const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
      fillColor: null,
      filledFaceKeys: [],
      id: 'path-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
      ...overrides,
    });

    it('should translate every vertex by the text box centre delta when the text is dragged', () => {
      // mock — text box moves +30/+40, so its centre moves the same
      const vectorNode = buildVectorNode();
      const textNode = buildPathText({ height: 0, width: 100, x: 30, y: 40 });
      const state = buildState({ [vectorNode.id]: vectorNode, [textNode.id]: textNode });

      // before
      syncPathNodeFromText(state, textNode, { height: 0, rotation: 0, width: 100, x: 0, y: 0 });

      // result
      expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).vertices).toEqual({
        v1: { id: 'v1', x: 30, y: 40 },
        v2: { id: 'v2', x: 130, y: 40 },
      });
    });

    it('should mirror the text rotation onto the vector so its line turns with the glyphs', () => {
      // mock — pure rotation: box centre is unchanged, only rotation
      const vectorNode = buildVectorNode();
      const textNode = buildPathText({ height: 0, rotation: 37, width: 100, x: 0, y: 0 });
      const state = buildState({ [vectorNode.id]: vectorNode, [textNode.id]: textNode });

      // before
      syncPathNodeFromText(state, textNode, { height: 0, rotation: 0, width: 100, x: 0, y: 0 });

      // result — rotation copied, vertices untouched (rotation is applied downstream, not baked here)
      const synced = getActivePage(state).nodes[vectorNode.id] as TVectorNode;
      expect(synced.rotation).toBe(37);
      expect(synced.vertices).toEqual({ v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } });
    });

    it('should leave the vertices alone when neither the centre nor the rotation moved', () => {
      // mock
      const vectorNode = buildVectorNode();
      const textNode = buildPathText({ height: 0, width: 100, x: 0, y: 0 });
      const state = buildState({ [vectorNode.id]: vectorNode, [textNode.id]: textNode });

      // before
      syncPathNodeFromText(state, textNode, { height: 0, rotation: 0, width: 100, x: 0, y: 0 });

      // result
      expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).vertices).toEqual({
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
      });
    });

    it('should scale every vertex with the text box so the path stretches to fill a resized box', () => {
      // mock — box grows 100x40 -> 150x80 (x1.5 wide, x2 tall), top-left anchored
      const vectorNode = buildVectorNode({ vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 } } });
      const textNode = buildPathText({ height: 80, width: 150, x: 0, y: 0 });
      const state = buildState({ [vectorNode.id]: vectorNode, [textNode.id]: textNode });

      // before
      syncPathNodeFromText(state, textNode, { height: 40, rotation: 0, width: 100, x: 0, y: 0 });

      // result — the vector's bounds now match the resized text box, so the glyphs reflow along it
      expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).vertices).toEqual({
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 150, y: 80 },
      });
    });

    it('should anchor the scale to the box new origin so a left-edge resize keeps the far edge put', () => {
      // mock — box grows leftward: width 100 -> 200 while the right edge stays at x = 100
      const vectorNode = buildVectorNode();
      const textNode = buildPathText({ height: 0, width: 200, x: -100, y: 0 });
      const state = buildState({ [vectorNode.id]: vectorNode, [textNode.id]: textNode });

      // before
      syncPathNodeFromText(state, textNode, { height: 0, rotation: 0, width: 100, x: 0, y: 0 });

      // result — v2, on the fixed right edge, does not move; v1 follows the growing left edge
      expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).vertices).toEqual({
        v1: { id: 'v1', x: -100, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
      });
    });

    it('should scale the segment tangent handles along with the vertices', () => {
      // mock — a curved segment carrying tangent handles, box scaled x2 wide / x3 tall
      const vectorNode = buildVectorNode({
        segments: {
          s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -20, y: -10 }, tangentStart: { x: 20, y: 10 } },
        },
      });
      const textNode = buildPathText({ height: 30, width: 200, x: 0, y: 0 });
      const state = buildState({ [vectorNode.id]: vectorNode, [textNode.id]: textNode });

      // before
      syncPathNodeFromText(state, textNode, { height: 10, rotation: 0, width: 100, x: 0, y: 0 });

      // result
      expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).segments.s1).toMatchObject({
        tangentEnd: { x: -40, y: -30 },
        tangentStart: { x: 40, y: 30 },
      });
    });
  });
});
