// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { getGridSectionHighlightDragRects } from '../getGridSectionHighlightDragRects';
import { getGridSectionHighlightRects } from '../getGridSectionHighlightRects';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  gridColumnCount: 3,
  gridRowCount: 2,
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
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
  sourceIndices: [1],
  ...overrides,
});

const COLUMN_1_CELLS = [
  { column: 1, row: 0 },
  { column: 1, row: 1 },
];

describe('getGridSectionHighlightDragRects', () => {
  it('should return the plain base rects when there is no drag state', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };

    // action
    const result = getGridSectionHighlightDragRects(frame, nodesById, COLUMN_1_CELLS, null);

    // result
    expect(result).toEqual(getGridSectionHighlightRects(frame, nodesById, COLUMN_1_CELLS));
  });

  it('should return the plain base rects while the drag has not moved yet', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };

    // action
    const result = getGridSectionHighlightDragRects(frame, nodesById, COLUMN_1_CELLS, dragStateFor({ hasMoved: false }));

    // result
    expect(result).toEqual(getGridSectionHighlightRects(frame, nodesById, COLUMN_1_CELLS));
  });

  it('should return the plain base rects when the drag belongs to a different frame', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };

    // action
    const result = getGridSectionHighlightDragRects(frame, nodesById, COLUMN_1_CELLS, dragStateFor({ frameId: 'other-frame' }));

    // result
    expect(result).toEqual(getGridSectionHighlightRects(frame, nodesById, COLUMN_1_CELLS));
  });

  it('should return the plain base rects when the highlighted cells are not the dragged column', () => {
    // mock — highlighting column 2, but dragging column 1
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };
    const column2Cells = [
      { column: 2, row: 0 },
      { column: 2, row: 1 },
    ];

    // action
    const result = getGridSectionHighlightDragRects(frame, nodesById, column2Cells, dragStateFor());

    // result
    expect(result).toEqual(getGridSectionHighlightRects(frame, nodesById, column2Cells));
  });

  it('should return the plain base rects when every highlighted cell is out of grid range', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };
    const outOfRangeCells = [{ column: 99, row: 99 }];

    // action
    const result = getGridSectionHighlightDragRects(frame, nodesById, outOfRangeCells, dragStateFor());

    // result
    expect(result).toEqual(getGridSectionHighlightRects(frame, nodesById, outOfRangeCells));
  });

  it('should shift the highlighted column’s cell and outline rects by the drag offset', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };
    const dragState = dragStateFor({ ghostPosition: { x: 300, y: 0 } });

    // before
    const base = getGridSectionHighlightRects(frame, nodesById, COLUMN_1_CELLS);

    // action
    const result = getGridSectionHighlightDragRects(frame, nodesById, COLUMN_1_CELLS, dragState);

    // result — every rect shifted along x by the same non-zero offset, y untouched
    const offset = result.cellRects[0].x - base.cellRects[0].x;

    expect(offset).not.toBe(0);
    expect(result.cellRects.map((rect) => rect.x)).toEqual(base.cellRects.map((rect) => rect.x + offset));
    expect(result.cellRects.map((rect) => rect.y)).toEqual(base.cellRects.map((rect) => rect.y));
    expect(result.outlineRect?.x).toBe((base.outlineRect?.x ?? 0) + offset);
  });

  it('should shift rects along y instead of x when the dragged axis is row', () => {
    // mock
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };
    const row0Cells = [
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 2, row: 0 },
    ];
    const dragState = dragStateFor({ axis: 'row', ghostPosition: { x: 0, y: 100 }, sourceIndices: [0] });

    // before
    const base = getGridSectionHighlightRects(frame, nodesById, row0Cells);

    // action
    const result = getGridSectionHighlightDragRects(frame, nodesById, row0Cells, dragState);

    // result
    const offset = result.cellRects[0].y - base.cellRects[0].y;

    expect(offset).not.toBe(0);
    expect(result.cellRects.map((rect) => rect.x)).toEqual(base.cellRects.map((rect) => rect.x));
    expect(result.outlineRect?.y).toBe((base.outlineRect?.y ?? 0) + offset);
  });

  it('should return a null outline rect, unshifted, for an empty cell list', () => {
    // mock — an empty cell list means isDraggedBlock is false too, so this returns the base as-is
    const frame = buildFrame();
    const nodesById = { 'frame-1': frame };

    // action
    const result = getGridSectionHighlightDragRects(frame, nodesById, [], dragStateFor());

    // result
    expect(result.outlineRect).toBeNull();
  });
});
