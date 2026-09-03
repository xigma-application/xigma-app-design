// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionGridAppendSuggestion } from '../getSmartSelectionGridAppendSuggestion';

const cell = (id: string, x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('getSmartSelectionGridAppendSuggestion', () => {
  it('should place the outlier into the nearest empty cell of an otherwise-valid grid', () => {
    // 2x3 grid with (row 0, column 1) left empty; x is the outlier
    const nodes = [cell('a', 0, 0), cell('c', 200, 0), cell('d', 0, 100), cell('e', 100, 100), cell('f', 200, 100), cell('x', 500, 500)];

    const suggestion = getSmartSelectionGridAppendSuggestion(nodes, 4, 4);

    expect(suggestion?.type).toBe('grid-append');
    expect(suggestion?.outlierId).toBe('x');
    expect(suggestion?.target).toEqual({ column: 1, height: 50, row: 0, width: 50, x: 100, y: 0 });
  });

  it('should extend by a new column, appended after, when a full grid has no holes and the outlier sits past its right edge', () => {
    // clean 2x2 grid (a,b / c,d); x aligns with row 0's band, past the right edge
    const nodes = [cell('a', 0, 0), cell('b', 100, 0), cell('c', 0, 100), cell('d', 100, 100), cell('x', 300, 0)];

    const suggestion = getSmartSelectionGridAppendSuggestion(nodes, 4, 4);

    expect(suggestion?.outlierId).toBe('x');
    expect(suggestion?.target).toEqual({ column: 2, height: 50, row: 0, width: 50, x: 200, y: 0 });
  });

  it('should extend by a new column, prepended before, when the outlier sits past the left edge', () => {
    const nodes = [cell('a', 200, 0), cell('b', 300, 0), cell('c', 200, 100), cell('d', 300, 100), cell('x', 0, 0)];

    const suggestion = getSmartSelectionGridAppendSuggestion(nodes, 4, 4);

    expect(suggestion?.outlierId).toBe('x');
    expect(suggestion?.target).toEqual({ column: -1, height: 50, row: 0, width: 50, x: 100, y: 0 });
  });

  it('should extend by a new row when the outlier aligns with an existing column band instead', () => {
    // clean 2x2 grid; x aligns with column 0's band, below the bottom edge
    const nodes = [cell('a', 0, 0), cell('b', 100, 0), cell('c', 0, 100), cell('d', 100, 100), cell('x', 0, 300)];

    const suggestion = getSmartSelectionGridAppendSuggestion(nodes, 4, 4);

    expect(suggestion?.outlierId).toBe('x');
    expect(suggestion?.target).toEqual({ column: 0, height: 50, row: 2, width: 50, x: 0, y: 200 });
  });

  it('should return null when the outlier matches neither an existing row nor column band', () => {
    const nodes = [cell('a', 0, 0), cell('b', 100, 0), cell('c', 0, 100), cell('d', 100, 100), cell('x', 500, 500)];

    expect(getSmartSelectionGridAppendSuggestion(nodes, 4, 4)).toBeNull();
  });

  it('should return null when no single exclusion yields a valid grid', () => {
    const nodes = [cell('a', 0, 0), cell('b', 500, 500), cell('c', 1000, 1000)];

    expect(getSmartSelectionGridAppendSuggestion(nodes, 4, 4)).toBeNull();
  });

  it('should pick the alphabetically-first outlier when more than one exclusion yields a valid grid', () => {
    // a clean, hole-free 3x3 grid: removing any single cell still leaves a valid grid behind (with a
    // hole at that cell's own former spot), so every node here is technically a candidate — 'a' sorts
    // first but sits last in the array (200,200), proving the tie is broken by id, not discovery order
    const nodes = [
      cell('i', 0, 0),
      cell('h', 100, 0),
      cell('g', 200, 0),
      cell('f', 0, 100),
      cell('e', 100, 100),
      cell('d', 200, 100),
      cell('c', 0, 200),
      cell('b', 100, 200),
      cell('a', 200, 200),
    ];

    const suggestion = getSmartSelectionGridAppendSuggestion(nodes, 4, 4);

    expect(suggestion?.outlierId).toBe('a');
    expect(suggestion?.target).toEqual({ column: 2, height: 50, row: 2, width: 50, x: 200, y: 200 });
  });
});
