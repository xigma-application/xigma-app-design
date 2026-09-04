// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TFrameNode, TGroupNode, TPathNode, TRectangleNode, TTextNode, TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleUpdateNode } from '../handleUpdateNode';

const node: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 10,
  id: 'node-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  commentDraftPosition: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isActionsPanelOpen: false,
  isMediaToolArmed: false,
  designHintLabelKey: null,
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
      backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
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

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
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

describe('handleUpdateNode', () => {
  it('should patch an existing node', () => {
    // mock
    const state = buildState({ [node.id]: { ...node } });

    // before
    handleUpdateNode(state, { changes: { width: 300 }, id: node.id });

    // result
    expect((getActivePage(state).nodes[node.id] as TFrameNode).width).toBe(300);
  });

  it('should keep a frame’s guides when a drag patches only x/y', () => {
    // mock
    const framed: TFrameNode = { ...node, guides: [{ axis: 'x', id: 'g1', position: 10 }] };
    const state = buildState({ [framed.id]: framed });

    // before
    handleUpdateNode(state, { changes: { x: 40, y: 60 }, id: framed.id });

    // result
    expect((getActivePage(state).nodes[framed.id] as TFrameNode).guides).toEqual([{ axis: 'x', id: 'g1', position: 10 }]);
  });

  it('should do nothing when the node does not exist', () => {
    // mock
    const state = buildState({});

    // before
    handleUpdateNode(state, { changes: { width: 300 }, id: 'missing' });

    // result
    expect(getActivePage(state).nodes).toEqual({});
  });

  it('should propagate a path-node resize/rotate to every text node bound to it', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    handleUpdateNode(state, { changes: { height: 300, rotation: 45, width: 300, x: 10, y: 20 }, id: pathNode.id });

    // result
    expect(getActivePage(state).nodes[textNode.id]).toMatchObject({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
  });

  it('should propagate a text-node resize/rotate back onto its source path node', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    handleUpdateNode(state, { changes: { height: 300, rotation: 45, width: 300, x: 10, y: 20 }, id: textNode.id });

    // result
    expect(getActivePage(state).nodes[pathNode.id]).toMatchObject({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
  });

  it('should propagate a vector-node reshape to every text node bound to it as a text path', () => {
    // mock — a 100x0 line reshaped into a 200-tall L-shape
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const textNode = buildPathText({ pathId: vectorNode.id });
    const state = buildState({ [textNode.id]: textNode, [vectorNode.id]: vectorNode });

    // before
    handleUpdateNode(state, {
      changes: { vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 0, y: 200 } } },
      id: vectorNode.id,
    });

    // result — the text box's bounds now match the reshaped vector, not the old ones
    expect(getActivePage(state).nodes[textNode.id]).toMatchObject({ height: 200, rotation: 0, width: 0, x: 0, y: 0 });
  });

  it('should drag the bound vector along with the text — every vertex shifts by the text box centre delta', () => {
    // mock — a horizontal line vector bound to a text box moved +30 / +40
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const textNode = buildPathText({ height: 0, pathId: vectorNode.id, width: 100, x: 0, y: 0 });
    const state = buildState({ [textNode.id]: textNode, [vectorNode.id]: vectorNode });

    // before
    handleUpdateNode(state, { changes: { x: 30, y: 40 }, id: textNode.id });

    // result
    expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).vertices).toEqual({
      a: { id: 'a', x: 30, y: 40 },
      b: { id: 'b', x: 130, y: 40 },
    });
  });

  it('should stretch the bound vector when the text box is resized so the glyphs reflow along it', () => {
    // mock — the text box doubles in width (100 -> 200), top-left anchored
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const textNode = buildPathText({ height: 0, pathId: vectorNode.id, width: 100, x: 0, y: 0 });
    const state = buildState({ [textNode.id]: textNode, [vectorNode.id]: vectorNode });

    // before
    handleUpdateNode(state, { changes: { width: 200 }, id: textNode.id });

    // result — the vector's span now matches the resized box (x runs 0..200), not the old 0..100
    expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).vertices).toEqual({
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 200, y: 0 },
    });
  });

  it('should mirror a text rotation onto its bound vector so the vector line turns with the glyphs', () => {
    // mock — pure rotation: the text box centre is unchanged
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const textNode = buildPathText({ height: 0, pathId: vectorNode.id, width: 100, x: 0, y: 0 });
    const state = buildState({ [textNode.id]: textNode, [vectorNode.id]: vectorNode });

    // before
    handleUpdateNode(state, { changes: { rotation: 37 }, id: textNode.id });

    // result — rotation copied to the vector, vertices untouched (applied once downstream)
    const synced = getActivePage(state).nodes[vectorNode.id] as TVectorNode;
    expect(synced.rotation).toBe(37);
    expect(synced.vertices).toEqual({ a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } });
  });

  it('should leave an unbound vector node update alone, without touching unrelated text nodes', () => {
    // mock
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const unrelatedText = buildPathText({ height: 50, pathId: 'some-other-path', width: 50, x: 5, y: 5 });
    const state = buildState({ [unrelatedText.id]: unrelatedText, [vectorNode.id]: vectorNode });

    // before
    handleUpdateNode(state, { changes: { strokeWidth: 8 }, id: vectorNode.id });

    // result
    expect(getActivePage(state).nodes[unrelatedText.id]).toMatchObject({ height: 50, width: 50, x: 5, y: 5 });
  });

  it('should discard a width profile when a segments patch makes the network branch', () => {
    // mock
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b') },
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } },
    });
    const state = buildState({ [vectorNode.id]: vectorNode });

    // before — patch in a third segment off 'b', turning it into a branch
    handleUpdateNode(state, {
      changes: { segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') } },
      id: vectorNode.id,
    });

    // result
    expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).widthProfile).toBeNull();
  });

  it('should keep a width profile when a segments patch keeps the network eligible', () => {
    // mock
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b') },
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } },
    });
    const state = buildState({ [vectorNode.id]: vectorNode });

    // before — extend the chain without branching
    handleUpdateNode(state, {
      changes: { segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') } },
      id: vectorNode.id,
    });

    // result
    expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).widthProfile).not.toBeNull();
  });

  it('should not run the width-profile eligibility check when the patch does not touch segments', () => {
    // mock
    const vectorNode = buildVectorNode({ strokeColor: '#000', widthProfile: null });
    const state = buildState({ [vectorNode.id]: vectorNode });

    // before
    handleUpdateNode(state, { changes: { strokeColor: '#fff' }, id: vectorNode.id });

    // result
    expect((getActivePage(state).nodes[vectorNode.id] as TVectorNode).strokeColor).toBe('#fff');
  });

  it('should move a rotated group box directly on a plain x/y update, without scaling its children', () => {
    // mock
    const child: TRectangleNode = {
      fill: '#fff',
      height: 20,
      id: 'child',
      name: 'Rectangle',
      parentId: 'group-1',
      rotation: 30,
      type: NodeType.rectangle,
      width: 20,
      x: 40,
      y: 40,
    };
    const group: TGroupNode = {
      childIds: ['child'],
      height: 100,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 30,
      type: NodeType.group,
      width: 100,
      x: 0,
      y: 0,
    };
    const state = buildState({ child, 'group-1': group });

    // before — a drag dispatches a plain x/y updateNode, no width/height
    handleUpdateNode(state, { changes: { x: 50, y: 20 }, id: 'group-1' });

    // result — the box itself moved, the child was left untouched (it gets its own updateNode in the same drag)
    expect(getActivePage(state).nodes['group-1']).toMatchObject({ height: 100, width: 100, x: 50, y: 20 });
    expect(getActivePage(state).nodes.child).toMatchObject({ height: 20, width: 20, x: 40, y: 40 });
  });

  it('should resync the parent group bounds after moving a child node', () => {
    // mock
    const child: TRectangleNode = {
      fill: '#fff',
      height: 10,
      id: 'child',
      name: 'Rectangle',
      parentId: 'group-1',
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    };
    const group: TGroupNode = {
      childIds: ['child'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({ child, 'group-1': group });

    // before
    handleUpdateNode(state, { changes: { x: 100, y: 50 }, id: 'child' });

    // result
    expect(getActivePage(state).nodes['group-1']).toMatchObject({ height: 10, width: 10, x: 100, y: 50 });
  });
});
