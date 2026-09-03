// types
import { TGridGeometry, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { isGridAligned } from '../isGridAligned';

const cell = (x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id: `${x},${y}` });

const GEOMETRY: TGridGeometry = { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] };

const buildCleanGrid = (): (TSmartSelectionNode | null)[][] => [
  [cell(0, 0), cell(100, 0)],
  [cell(0, 100), cell(100, 100)],
];

describe('isGridAligned', () => {
  it('should accept a grid whose cells sit on their column/row geometry', () => {
    expect(isGridAligned(buildCleanGrid(), GEOMETRY, 4)).toBe(true);
  });

  it('should ignore empty cells', () => {
    const cells = buildCleanGrid();

    cells[1][1] = null;

    expect(isGridAligned(cells, GEOMETRY, 4)).toBe(true);
  });

  it('should accept a mismatch within tolerance', () => {
    const cells = buildCleanGrid();

    cells[1][0] = cell(2, 100);

    expect(isGridAligned(cells, GEOMETRY, 4)).toBe(true);
  });

  it('should reject a cell whose x is off its column', () => {
    const cells = buildCleanGrid();

    cells[1][0] = cell(20, 100);

    expect(isGridAligned(cells, GEOMETRY, 4)).toBe(false);
  });

  it('should reject a cell whose width does not match the grid', () => {
    const cells = buildCleanGrid();

    cells[1][0] = cell(0, 100, 80);

    expect(isGridAligned(cells, GEOMETRY, 4)).toBe(false);
  });

  it('should reject a cell whose y is off its row', () => {
    const cells = buildCleanGrid();

    cells[0][1] = cell(100, 20);

    expect(isGridAligned(cells, GEOMETRY, 4)).toBe(false);
  });

  it('should reject a cell whose height does not match the grid', () => {
    const cells = buildCleanGrid();

    cells[0][1] = cell(100, 0, 50, 80);

    expect(isGridAligned(cells, GEOMETRY, 4)).toBe(false);
  });
});
