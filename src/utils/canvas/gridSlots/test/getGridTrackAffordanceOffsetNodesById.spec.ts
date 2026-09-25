// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TRectangleNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { getGridTrackAffordanceOffsetNodesById } from '../getGridTrackAffordanceOffsetNodesById';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['a', 'b'],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  gridColumnCount: 2,
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const rect = (id: string, overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#000', opacity: 100, type: 'solid' }],
  height: 20,
  id,
  name: id,
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 30,
  x: 0,
  y: 0,
  ...overrides,
});

const dragStateFor = (overrides: Partial<TGridTrackAffordanceDragState> = {}): TGridTrackAffordanceDragState => ({
  axis: 'column',
  dropIndex: 0,
  frameId: 'frame-1',
  ghostPosition: { x: 0, y: 0 },
  hasMoved: true,
  sourceIndices: [0],
  ...overrides,
});

describe('getGridTrackAffordanceOffsetNodesById', () => {
  it('should nudge only the children placed in the dragged column, leaving the others untouched', () => {
    // mock — 2 children auto-flow into column 0 and column 1 of row 0
    const frame = buildFrame();
    const nodesById = { a: rect('a'), b: rect('b'), 'frame-1': frame };

    // action
    const next = getGridTrackAffordanceOffsetNodesById(frame, nodesById, dragStateFor({ sourceIndices: [0] }), 15);

    // result
    expect(next.a).toMatchObject({ x: 15 });
    expect(next.b).toBe(nodesById.b);
  });

  it('should nudge the children placed in the dragged row, along y, when the axis is row', () => {
    // mock — 3 children, 2 columns: a/b fill row 0, c wraps onto row 1
    const frame = buildFrame({ childIds: ['a', 'b', 'c'] });
    const nodesById = { a: rect('a'), b: rect('b'), c: rect('c'), 'frame-1': frame };

    // action
    const next = getGridTrackAffordanceOffsetNodesById(frame, nodesById, dragStateFor({ axis: 'row', sourceIndices: [1] }), 15);

    // result
    expect(next.a).toBe(nodesById.a);
    expect(next.b).toBe(nodesById.b);
    expect(next.c).toMatchObject({ y: 15 });
  });

  it('should return the same nodesById reference, unchanged, when the offset is zero', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { a: rect('a'), b: rect('b'), 'frame-1': frame };

    // action
    const next = getGridTrackAffordanceOffsetNodesById(frame, nodesById, dragStateFor({ sourceIndices: [0] }), 0);

    // result
    expect(next).toBe(nodesById);
  });

  it('should return the same nodesById reference, unchanged, when the dragged track has no children in it', () => {
    // mock — only 2 columns exist, index 5 is out of range for either child
    const frame = buildFrame();
    const nodesById = { a: rect('a'), b: rect('b'), 'frame-1': frame };

    // action
    const next = getGridTrackAffordanceOffsetNodesById(frame, nodesById, dragStateFor({ sourceIndices: [5] }), 15);

    // result
    expect(next).toBe(nodesById);
  });

  it('should default to a single column when the frame has no gridColumnCount set', () => {
    // mock — with no column count, both children auto-flow into a single column, stacked in rows
    const frame = buildFrame({ gridColumnCount: undefined });
    const nodesById = { a: rect('a'), b: rect('b'), 'frame-1': frame };

    // action
    const next = getGridTrackAffordanceOffsetNodesById(frame, nodesById, dragStateFor({ sourceIndices: [0] }), 15);

    // result — both land in column 0, since there is only one column
    expect(next.a).toMatchObject({ x: 15 });
    expect(next.b).toMatchObject({ x: 15 });
  });

  it('should skip a matched placement that is not a box scene node, such as a line', () => {
    // mock
    const frame = buildFrame();
    const lineChild: TLineNode = {
      id: 'a',
      name: 'Line',
      parentId: 'frame-1',
      strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      x1: 0,
      x2: 30,
      y1: 0,
      y2: 0,
    };
    const nodesById = { a: lineChild, b: rect('b'), 'frame-1': frame };

    // action
    const next = getGridTrackAffordanceOffsetNodesById(frame, nodesById, dragStateFor({ sourceIndices: [0] }), 15);

    // result
    expect(next.a).toBe(nodesById.a);
  });
});
