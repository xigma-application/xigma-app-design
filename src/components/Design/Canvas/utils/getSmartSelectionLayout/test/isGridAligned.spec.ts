// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { isGridAligned } from '../isGridAligned';

const cell = (x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id: `${x},${y}` });

const buildCleanGrid = (): TSmartSelectionNode[][] => [
  [cell(0, 0), cell(100, 0)],
  [cell(0, 100), cell(100, 100)],
];

describe('isGridAligned', () => {
  it('should accept a grid whose columns and rows line up', () => {
    expect(isGridAligned(buildCleanGrid(), 4)).toBe(true);
  });

  it('should accept a mismatch within tolerance', () => {
    const cells = buildCleanGrid();

    cells[1][0] = cell(2, 100);

    expect(isGridAligned(cells, 4)).toBe(true);
  });

  it('should reject a column whose x does not line up down the column', () => {
    const cells = buildCleanGrid();

    cells[1][0] = cell(20, 100);

    expect(isGridAligned(cells, 4)).toBe(false);
  });

  it('should reject a column whose width does not line up down the column', () => {
    const cells = buildCleanGrid();

    cells[1][0] = cell(0, 100, 80);

    expect(isGridAligned(cells, 4)).toBe(false);
  });

  it('should reject a row whose y does not line up across the row', () => {
    const cells = buildCleanGrid();

    cells[0][1] = cell(100, 20);

    expect(isGridAligned(cells, 4)).toBe(false);
  });

  it('should reject a row whose height does not line up across the row', () => {
    const cells = buildCleanGrid();

    cells[0][1] = cell(100, 0, 50, 80);

    expect(isGridAligned(cells, 4)).toBe(false);
  });
});
