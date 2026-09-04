// types
import { AlignmentLayout, LayoutMode, NodeType, SizingMode, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TFrameNode, TGroupNode, TLineNode, TRectangleNode, TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { syncAutoLayoutChildren } from '../syncAutoLayoutChildren';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#fff',
  height: 20,
  id: 'r',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const frame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const buildState = (page: Partial<TDesignPage>): TDesignState => ({
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
      nodes: {},
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      ...page,
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('syncAutoLayoutChildren', () => {
  it('should reposition children left to right when the frame flows horizontally', () => {
    // mock
    const a = rect({ id: 'a', width: 30, x: 999, y: 999 });
    const b = rect({ id: 'b', width: 50, x: 999, y: 999 });
    const layoutFrame = frame({ childIds: ['a', 'b'], itemSpacing: 10, layoutMode: LayoutMode.horizontal, x: 100, y: 200 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 100, y: 200 });
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 140, y: 200 });
  });

  it('should reposition children top to bottom when the frame flows vertically', () => {
    // mock
    const a = rect({ height: 30, id: 'a', x: 999, y: 999 });
    const b = rect({ height: 50, id: 'b', x: 999, y: 999 });
    const layoutFrame = frame({ childIds: ['a', 'b'], itemSpacing: 10, layoutMode: LayoutMode.vertical, x: 100, y: 200 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 100, y: 200 });
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 100, y: 240 });
  });

  it('should inset children from the frame’s edges by its padding', () => {
    // mock
    const a = rect({ id: 'a', width: 30 });
    const layoutFrame = frame({
      childIds: ['a'],
      layoutMode: LayoutMode.horizontal,
      paddingLeft: 8,
      paddingTop: 4,
      x: 100,
      y: 200,
    });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 108, y: 204 });
  });

  it('should hug the frame’s width and height to its children, on the primary and counter axis', () => {
    // mock — two children (30+50 wide, gap 10) inside a frame whose declared size is otherwise ignored
    const a = rect({ height: 20, id: 'a', width: 30 });
    const b = rect({ height: 60, id: 'b', width: 50 });
    const layoutFrame = frame({
      childIds: ['a', 'b'],
      counterAxisSizingMode: SizingMode.hug,
      height: 999,
      itemSpacing: 10,
      layoutMode: LayoutMode.horizontal,
      primaryAxisSizingMode: SizingMode.hug,
      width: 999,
      x: 0,
      y: 0,
    });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — width hugs the content length (30+10+50=90), height hugs the tallest child (60)
    expect(getActivePage(state).nodes['frame-1']).toMatchObject({ height: 60, width: 90 });
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 40, y: 0 });
  });

  it('should leave the frame’s size untouched when both sizing modes are fixed (or unset)', () => {
    // mock
    const a = rect({ height: 20, id: 'a', width: 30 });
    const layoutFrame = frame({ childIds: ['a'], height: 200, layoutMode: LayoutMode.horizontal, width: 500, x: 0, y: 0 });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes['frame-1']).toMatchObject({ height: 200, width: 500 });
  });

  it('should default a missing itemSpacing to zero', () => {
    // mock
    const a = rect({ id: 'a', width: 30 });
    const b = rect({ id: 'b', width: 50 });
    const layoutFrame = frame({ childIds: ['a', 'b'], layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 30, y: 0 });
  });

  it('should no-op for a null id', () => {
    // mock
    const state = buildState({ nodes: {} });

    // action / result
    expect(() => syncAutoLayoutChildren(state, null)).not.toThrow();
  });

  it('should no-op when the id does not resolve to a frame', () => {
    // mock
    const a = rect({ id: 'a', parentId: null });
    const state = buildState({ nodes: { a } });

    // action
    syncAutoLayoutChildren(state, 'a');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 0, y: 0 });
  });

  it('should no-op when the frame has no layout mode', () => {
    // mock
    const a = rect({ id: 'a', x: 5, y: 5 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 5, y: 5 });
  });

  it('should no-op when the layout mode is freeForm', () => {
    // mock
    const a = rect({ id: 'a', x: 5, y: 5 });
    const layoutFrame = frame({ childIds: ['a'], layoutMode: LayoutMode.freeForm });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 5, y: 5 });
  });

  it('should centre children on the counter axis when layoutAlignment is set', () => {
    // mock — a 20-tall child inside a 100-tall horizontal frame
    const a = rect({ height: 20, id: 'a', width: 30 });
    const layoutFrame = frame({
      childIds: ['a'],
      height: 100,
      layoutAlignment: AlignmentLayout.left,
      layoutMode: LayoutMode.horizontal,
      x: 0,
      y: 0,
    });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — vertically centred: (100-20)/2 = 40
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 0, y: 40 });
  });

  it('should default a missing layoutAlignment to topLeft', () => {
    // mock
    const a = rect({ id: 'a', width: 30 });
    const layoutFrame = frame({ childIds: ['a'], layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 0, y: 0 });
  });

  it('should cascade the reposition delta onto a container child’s nested descendants, so they move along with it', () => {
    // mock — a group sitting inside the auto-layout frame, with its own nested child
    const a = rect({ height: 20, id: 'a', width: 30 });
    const nested = rect({ height: 20, id: 'nested', parentId: 'b', width: 20, x: 5, y: 5 });
    const group: TGroupNode = {
      childIds: ['nested'],
      height: 20,
      id: 'b',
      name: 'Group',
      parentId: 'frame-1',
      rotation: 0,
      type: NodeType.group,
      width: 20,
      x: 0,
      y: 0,
    };
    const layoutFrame = frame({ childIds: ['a', 'b'], itemSpacing: 10, layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const state = buildState({ nodes: { a, b: group, 'frame-1': layoutFrame, nested } });

    // action — the group's box moves from x=0 to x=40 (after the 30-wide rect plus a 10 gap), a +40/+0 delta
    syncAutoLayoutChildren(state, 'frame-1');

    // result — the group itself, and its nested child, both shift by the same delta
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 40, y: 0 });
    expect(getActivePage(state).nodes.nested).toMatchObject({ x: 45, y: 5 });
  });

  it('should treat a vector child as a box, shifting its vertices by the bounding-box delta', () => {
    // mock — a 40x10 vector sitting at the origin, next to a 30-wide rectangle
    const a = rect({ height: 20, id: 'a', width: 30 });
    const seg: TVectorSegment = { endId: 'p2', id: 's1', startId: 'p1', tangentEnd: null, tangentStart: null };
    const vector: TVectorNode = {
      defaultFill: [],
      filledFaceKeys: [],
      id: 'b',
      name: 'Vector',
      parentId: 'frame-1',
      rotation: 0,
      segments: { s1: seg },
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { p1: { id: 'p1', x: 0, y: 0 }, p2: { id: 'p2', x: 40, y: 10 } },
    };
    const layoutFrame = frame({ childIds: ['a', 'b'], itemSpacing: 10, layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const state = buildState({ nodes: { a, b: vector, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — the vector's box moves to x=40 (after the 30-wide rect plus a 10 gap), so every vertex shifts by +40/+0
    expect((getActivePage(state).nodes.b as TVectorNode).vertices).toEqual({
      p1: { id: 'p1', x: 40, y: 0 },
      p2: { id: 'p2', x: 80, y: 10 },
    });
  });

  it('should treat a line child as a box, shifting its endpoints by the bounding-box delta', () => {
    // mock — a 20-long horizontal line at the origin, next to a 30-wide rectangle
    const a = rect({ height: 20, id: 'a', width: 30 });
    const line: TLineNode = {
      id: 'b',
      name: 'Line',
      parentId: 'frame-1',
      stroke: '#000',
      type: NodeType.line,
      x1: 0,
      x2: 20,
      y1: 0,
      y2: 0,
    };
    const layoutFrame = frame({ childIds: ['a', 'b'], layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const state = buildState({ nodes: { a, b: line, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — the line's box moves to x=30 (right after the rect, no gap), so both endpoints shift by +30
    expect(getActivePage(state).nodes.b).toMatchObject({ x1: 30, x2: 50, y1: 0, y2: 0 });
  });

  it('should skip a child id that no longer resolves to a node', () => {
    // mock
    const layoutFrame = frame({ childIds: ['gone'], layoutMode: LayoutMode.horizontal });
    const state = buildState({ nodes: { 'frame-1': layoutFrame } });

    // action / result
    expect(() => syncAutoLayoutChildren(state, 'frame-1')).not.toThrow();
  });
});
