// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { armGridDropTarget } from '../armGridDropTarget';

const refs = (): TCanvasRefs => ({ transform: { gridDropTargetRef: { current: null } } }) as unknown as TCanvasRefs;

const anchoredChild = (id: string, column: number, row: number): TSceneNode =>
  ({
    fill: '#000',
    gridColumnAnchorIndex: column,
    gridRowAnchorIndex: row,
    height: 10,
    id,
    name: id,
    parentId: 'grid-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridAutoPlacement: false,
  gridColumnCount: 2,
  gridRowCount: 2,
  height: 200,
  id: 'grid-1',
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

describe('armGridDropTarget', () => {
  it('should resolve one cell per dragged node, starting at the hovered cell', () => {
    // mock
    const canvasRefs = refs();

    // action — 100px cells; point (50, 50) => column 0, row 0; two nodes
    armGridDropTarget(canvasRefs, frame(), 'grid-1', ['x', 'y'], {}, { x: 50, y: 50 });

    // result
    expect(canvasRefs.transform.gridDropTargetRef.current).toEqual({
      cells: [
        { column: 0, row: 0 },
        { column: 1, row: 0 },
      ],
      frameId: 'grid-1',
    });
  });

  it('should skip cells already occupied by other children and grow rows to fit', () => {
    // mock — bottom row (row 1) of a 2x2 grid is full
    const canvasRefs = refs();
    const nodesById = { a: anchoredChild('a', 0, 1), b: anchoredChild('b', 1, 1) };

    // action — hover the top-left cell, drop three nodes
    armGridDropTarget(canvasRefs, frame({ childIds: ['a', 'b'] }), 'grid-1', ['x', 'y', 'z'], nodesById, { x: 50, y: 50 });

    // result — (0,0), (0,1), then a new row (2,0) since row 1 is taken
    expect(canvasRefs.transform.gridDropTargetRef.current).toEqual({
      cells: [
        { column: 0, row: 0 },
        { column: 1, row: 0 },
        { column: 0, row: 2 },
      ],
      frameId: 'grid-1',
    });
  });

  it('should not count the dragged children themselves as occupancy on a same-parent drag', () => {
    // mock — the two anchored children are the ones being dragged
    const canvasRefs = refs();
    const nodesById = { a: anchoredChild('a', 0, 1), b: anchoredChild('b', 1, 1) };

    // action
    armGridDropTarget(canvasRefs, frame({ childIds: ['a', 'b'] }), 'grid-1', ['a', 'b'], nodesById, { x: 50, y: 50 });

    // result — nothing else occupies the grid, so they land at (0,0) and (0,1)
    expect(canvasRefs.transform.gridDropTargetRef.current?.cells).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
    ]);
  });

  it('should arm an insertion indicator when hovering the near edge of an occupied, boxed-in cell', () => {
    // mock — the single child fills the top-left cell, against the left wall
    const canvasRefs = refs();
    const nodesById = { a: anchoredChild('a', 0, 0) };

    // action — hover the left slice of that cell
    armGridDropTarget(canvasRefs, frame({ childIds: ['a'] }), 'grid-1', ['x'], nodesById, { x: 20, y: 50 });

    // result — no cell highlight, a left indicator, and an insert index of 0
    expect(canvasRefs.transform.gridDropTargetRef.current).toEqual({
      cells: [],
      frameId: 'grid-1',
      indicator: { column: 0, row: 0, side: 'left' },
      insertIndex: 0,
    });
  });

  it('should unrotate the query point about the frame centre for a rotated grid', () => {
    // mock
    const canvasRefs = refs();

    // action — (150, 50) unrotates into the first cell for a 90°-rotated 200x200 frame
    armGridDropTarget(canvasRefs, frame({ rotation: 90 }), 'grid-1', ['x'], {}, { x: 150, y: 50 });

    // result
    expect(canvasRefs.transform.gridDropTargetRef.current?.cells).toEqual([{ column: 0, row: 0 }]);
  });
});
