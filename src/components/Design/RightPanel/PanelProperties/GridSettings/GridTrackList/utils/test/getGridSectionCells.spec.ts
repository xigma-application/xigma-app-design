// utils
import { getGridSectionCells } from '../getGridSectionCells';

describe('getGridSectionCells', () => {
  it('should expand each selected column into a cell per row', () => {
    expect(getGridSectionCells('column', [1], 3)).toEqual([
      { column: 1, row: 0 },
      { column: 1, row: 1 },
      { column: 1, row: 2 },
    ]);
  });

  it('should expand each selected row into a cell per column', () => {
    expect(getGridSectionCells('row', [0, 1], 2)).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 0, row: 1 },
      { column: 1, row: 1 },
    ]);
  });

  it('should return no cells when nothing is selected', () => {
    expect(getGridSectionCells('column', [], 4)).toEqual([]);
  });

  it('should return no cells when the cross axis has no tracks', () => {
    expect(getGridSectionCells('column', [0, 2], 0)).toEqual([]);
  });
});
