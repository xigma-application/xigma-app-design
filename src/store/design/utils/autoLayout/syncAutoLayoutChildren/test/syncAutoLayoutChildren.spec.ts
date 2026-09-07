// types
import { AlignmentLayout, LayoutMode, NodeType, SizingMode, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../../types';
import { TFrameNode, TGroupNode, TLineNode, TRectangleNode, TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getActivePage } from '../../../getActivePage';
import { getRotatedNodeBounds } from '../../../getRotatedNodeBounds';
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
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
  vectorEditingNodeIds: [],
});

describe('syncAutoLayoutChildren', () => {
  it('should reposition children left to right when the frame flows horizontally', () => {
    // mock
    const a = rect({ id: 'a', width: 30, x: 999, y: 999 });
    const b = rect({ id: 'b', width: 50, x: 999, y: 999 });
    const layoutFrame = frame({ childIds: ['a', 'b'], horizontalGap: 10, layoutMode: LayoutMode.horizontal, x: 100, y: 200 });
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
    const layoutFrame = frame({ childIds: ['a', 'b'], layoutMode: LayoutMode.vertical, verticalGap: 10, x: 100, y: 200 });
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
      height: 999,
      heightSizingMode: SizingMode.hug,
      horizontalGap: 10,
      layoutMode: LayoutMode.horizontal,
      width: 999,
      widthSizingMode: SizingMode.hug,
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

  it('should wrap children onto a new line once they overflow the frame’s width', () => {
    // mock — two 50-wide children can't both fit in a 50-wide frame
    const a = rect({ height: 20, id: 'a', width: 50 });
    const b = rect({ height: 20, id: 'b', width: 50 });
    const layoutFrame = frame({
      childIds: ['a', 'b'],
      height: 100,
      layoutMode: LayoutMode.horizontal,
      layoutWrap: true,
      verticalGap: 5,
      width: 50,
      x: 0,
      y: 0,
    });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 0, y: 0 });
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 0, y: 25 });
  });

  it('should hug the frame’s height to the wrapped block when wrap is on and the counter axis hugs', () => {
    // mock
    const a = rect({ height: 20, id: 'a', width: 50 });
    const b = rect({ height: 30, id: 'b', width: 50 });
    const layoutFrame = frame({
      childIds: ['a', 'b'],
      height: 999,
      heightSizingMode: SizingMode.hug,
      layoutMode: LayoutMode.horizontal,
      layoutWrap: true,
      verticalGap: 5,
      width: 50,
      x: 0,
      y: 0,
    });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — two lines (20+30) plus the 5px gap between them = 55
    expect(getActivePage(state).nodes['frame-1']).toMatchObject({ height: 55, width: 50 });
  });

  it('should default a missing verticalGap to horizontalGap', () => {
    // mock
    const a = rect({ height: 20, id: 'a', width: 50 });
    const b = rect({ height: 20, id: 'b', width: 50 });
    const layoutFrame = frame({
      childIds: ['a', 'b'],
      height: 100,
      horizontalGap: 15,
      layoutMode: LayoutMode.horizontal,
      layoutWrap: true,
      width: 50,
      x: 0,
      y: 0,
    });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — the second line is offset by the first line's 20px thickness plus the 15px horizontalGap fallback
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 0, y: 35 });
  });

  it('should default a missing horizontalGap to zero', () => {
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
    const layoutFrame = frame({ childIds: ['a', 'b'], horizontalGap: 10, layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
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
    const layoutFrame = frame({ childIds: ['a', 'b'], horizontalGap: 10, layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
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

  it('should position a rotated child by its rotated bounding box, not its raw un-rotated box', () => {
    // mock — a 10x10 square rotated 45deg (rotated bbox side = 10*sqrt(2)) next to a 20-wide rect,
    // in a horizontal frame with no gap
    const square = rect({ height: 10, id: 'a', rotation: 45, width: 10, x: 999, y: 999 });
    const b = rect({ id: 'b', width: 20, x: 999, y: 999 });
    const layoutFrame = frame({ childIds: ['a', 'b'], layoutMode: LayoutMode.horizontal, x: 100, y: 200 });
    const state = buildState({ nodes: { a: square, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — the square's rotated bounding box (not its raw 10x10 local box) sits flush at the
    // frame's own top-left; b starts right after the square's *rotated* footprint, not its raw one
    const aBounds = getRotatedNodeBounds(getActivePage(state).nodes.a);
    const expectedSide = 10 * Math.sqrt(2);

    expect(aBounds.x).toBeCloseTo(100, 0);
    expect(aBounds.y).toBeCloseTo(200, 0);
    expect(getActivePage(state).nodes.b).toMatchObject({ x: Math.round(100 + expectedSide), y: 200 });
  });

  it('should orbit a child’s flow slot around the frame’s own centre when the frame itself is rotated', () => {
    // mock — a 100x100 (square) frame at the origin (centre at 50,50), rotated 90deg; a single
    // 30x20 child would sit flush at the frame's own top-left (0,0) were the frame unrotated, and
    // the child itself is NOT independently tilted (rotation: 0, unlike the frame)
    const a = rect({ height: 20, id: 'a', width: 30, x: 999, y: 999 });
    const layoutFrame = frame({ childIds: ['a'], height: 100, layoutMode: LayoutMode.horizontal, rotation: 90, width: 100, x: 0, y: 0 });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — since the child stays axis-aligned in world space while the frame rotates around it,
    // its footprint *as seen from inside the frame's own tilted axes* is the 30x20 box swapped to
    // 20x30 (packed by getAutoLayoutChildLocalBounds, using rotation relative to the frame, exactly
    // like an independently-rotated child is packed by its own rotated bounding box); flush top-left
    // in that local space orbits the frame's centre (50,50) by 90deg to land flush in the top-RIGHT
    // corner instead — still exactly inside the (square) frame's own edges, not overflowing past x=100
    // the way a naive "keep using the raw 30x20 box" orbit would (that would land at x:75-105)
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 70, y: 0 });
  });

  it('should keep siblings evenly spaced — not pushed apart — when every child rigidly inherited the frame’s own rotation', () => {
    // mock — found live by the user: rotating a frame via the interactive rotate-handle also rigidly
    // rotates every descendant leaf by the same delta (continueRotateDrag), so each auto-layout child
    // ends up with its OWN rotation equal to the frame's. Three 60x20 children, no gap, in a 200x100
    // frame (centre 100,50), all now tilted 45deg to match the frame
    const a = rect({ height: 20, id: 'a', rotation: 45, width: 60, x: 999, y: 999 });
    const b = rect({ height: 20, id: 'b', rotation: 45, width: 60, x: 999, y: 999 });
    const c = rect({ height: 20, id: 'c', rotation: 45, width: 60, x: 999, y: 999 });
    const layoutFrame = frame({
      childIds: ['a', 'b', 'c'],
      height: 100,
      layoutMode: LayoutMode.horizontal,
      rotation: 45,
      width: 200,
      x: 0,
      y: 0,
    });
    const state = buildState({ nodes: { a, b, c, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — each child's rotation relative to the frame is 0 (45-45), so they pack by their real
    // 60x20 footprint, not an inflated world-axis-aligned AABB of an already-45deg-tilted box; a
    // rigid rotation preserves distances, so consecutive centres must stay exactly 60 apart, the
    // same as the un-rotated row — before the fix, the absolute-rotation AABB (bigger than 60x20)
    // inflated the flow spacing, so siblings drifted farther apart the further along the row they sat
    const centreOf = (node: { height: number; width: number; x: number; y: number }): { x: number; y: number } => ({
      x: node.x + node.width / 2,
      y: node.y + node.height / 2,
    });
    const nodes = getActivePage(state).nodes;
    const distance = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);
    const centreA = centreOf(nodes.a as TRectangleNode);
    const centreB = centreOf(nodes.b as TRectangleNode);
    const centreC = centreOf(nodes.c as TRectangleNode);

    expect(distance(centreA, centreB)).toBeCloseTo(60, 0);
    expect(distance(centreB, centreC)).toBeCloseTo(60, 0);
  });

  it('should skip a child id that no longer resolves to a node', () => {
    // mock
    const layoutFrame = frame({ childIds: ['gone'], layoutMode: LayoutMode.horizontal });
    const state = buildState({ nodes: { 'frame-1': layoutFrame } });

    // action / result
    expect(() => syncAutoLayoutChildren(state, 'frame-1')).not.toThrow();
  });

  it('should grow a single filling child to consume the leftover primary-axis space', () => {
    // mock — a 300-wide frame, a fixed 50-wide sibling, a 10 gap, and one filling child
    const a = rect({ height: 20, id: 'a', width: 50 });
    const b = rect({ height: 20, id: 'b', width: 20, widthSizingMode: SizingMode.fill });
    const layoutFrame = frame({ childIds: ['a', 'b'], horizontalGap: 10, layoutMode: LayoutMode.horizontal, width: 300, x: 0, y: 0 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — leftover = 300 - 50 - 10 = 240, all of it goes to b
    expect(getActivePage(state).nodes.b).toMatchObject({ width: 240, x: 60, y: 0 });
  });

  it('should split the leftover primary-axis space evenly between several filling children', () => {
    // mock — a 220-wide frame, no fixed sibling, two 10px gaps, three filling children
    const a = rect({ height: 20, id: 'a', width: 10, widthSizingMode: SizingMode.fill });
    const b = rect({ height: 20, id: 'b', width: 10, widthSizingMode: SizingMode.fill });
    const c = rect({ height: 20, id: 'c', width: 10, widthSizingMode: SizingMode.fill });
    const layoutFrame = frame({
      childIds: ['a', 'b', 'c'],
      horizontalGap: 10,
      layoutMode: LayoutMode.horizontal,
      width: 220,
      x: 0,
      y: 0,
    });
    const state = buildState({ nodes: { a, b, c, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — leftover = 220 - 20 (two gaps) = 200, split evenly = ~66.67 each
    const nodes = getActivePage(state).nodes;

    expect((nodes.a as TRectangleNode).width).toBeCloseTo(200 / 3, 1);
    expect((nodes.b as TRectangleNode).width).toBeCloseTo(200 / 3, 1);
    expect((nodes.c as TRectangleNode).width).toBeCloseTo(200 / 3, 1);
  });

  it('should stretch a counter-axis filling child to the frame’s content-box cross size', () => {
    // mock — a 100-tall horizontal frame, one child filling the counter (height) axis
    const a = rect({ height: 20, heightSizingMode: SizingMode.fill, id: 'a', width: 30 });
    const layoutFrame = frame({ childIds: ['a'], height: 100, layoutMode: LayoutMode.horizontal, width: 200, x: 0, y: 0 });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ height: 100, width: 30 });
  });

  it('should not grow a filling child on an axis where the parent frame itself is hugging that axis', () => {
    // mock — the frame hugs its own width, so there is no leftover budget to hand to a filling child
    const a = rect({ height: 20, id: 'a', width: 30, widthSizingMode: SizingMode.fill });
    const layoutFrame = frame({ childIds: ['a'], layoutMode: LayoutMode.horizontal, widthSizingMode: SizingMode.hug, x: 0, y: 0 });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — a stays at its own 30px width, and the frame hugs to exactly that
    expect(getActivePage(state).nodes.a).toMatchObject({ width: 30 });
    expect(getActivePage(state).nodes['frame-1']).toMatchObject({ width: 30 });
  });

  it('should skip fill-resizing a child that is independently rotated relative to the frame', () => {
    // mock — a child tilted 45deg relative to an unrotated frame has no well-defined "grown" local box
    const a = rect({ height: 20, id: 'a', rotation: 45, width: 30, widthSizingMode: SizingMode.fill });
    const layoutFrame = frame({ childIds: ['a'], layoutMode: LayoutMode.horizontal, width: 300, x: 0, y: 0 });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — width is left untouched, since the child's rotation differs from the frame's
    expect(getActivePage(state).nodes.a).toMatchObject({ width: 30 });
  });

  it('should not recurse into a frame child that has no auto-layout of its own', () => {
    // mock — the inner frame is a plain (freeForm) frame with two overlapping children; if a
    // recursive auto-layout re-sync ran on it, it would pack and separate them
    const inner = frame({ childIds: ['x', 'y'], height: 20, id: 'inner', parentId: 'frame-1', width: 20, x: 999, y: 999 });
    const x = rect({ height: 10, id: 'x', parentId: 'inner', width: 10, x: 5, y: 5 });
    const y = rect({ height: 10, id: 'y', parentId: 'inner', width: 10, x: 5, y: 5 });
    const outer = frame({ childIds: ['inner'], layoutMode: LayoutMode.horizontal, width: 300, x: 0, y: 0 });
    const state = buildState({ nodes: { 'frame-1': outer, inner, x, y } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — the inner frame moved into flow, carrying both children by the same translation,
    // so they still sit exactly on top of each other rather than being packed apart
    const nodes = getActivePage(state).nodes;

    expect({ x: (nodes.x as TRectangleNode).x, y: (nodes.x as TRectangleNode).y }).toEqual({
      x: (nodes.y as TRectangleNode).x,
      y: (nodes.y as TRectangleNode).y,
    });
  });

  it('should reflow a nested auto-layout frame’s own children after it gets resized by fill', () => {
    // mock — an outer horizontal frame with a filling inner frame, which itself lays out a child
    const inner = frame({
      childIds: ['innerChild'],
      height: 20,
      id: 'inner',
      layoutMode: LayoutMode.horizontal,
      parentId: 'frame-1',
      width: 20,
      widthSizingMode: SizingMode.fill,
    });
    const innerChild = rect({ height: 20, id: 'innerChild', parentId: 'inner', width: 20, x: 999, y: 999 });
    const outer = frame({ childIds: ['inner'], layoutMode: LayoutMode.horizontal, width: 300, x: 0, y: 0 });
    const state = buildState({ nodes: { 'frame-1': outer, inner, innerChild } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result — inner grows to fill the outer frame (300 wide), and its own child gets repositioned
    // relative to inner's new (grown) box, proving the recursive re-sync actually ran
    expect(getActivePage(state).nodes.inner).toMatchObject({ width: 300, x: 0, y: 0 });
    expect(getActivePage(state).nodes.innerChild).toMatchObject({ x: 0, y: 0 });
  });
});
