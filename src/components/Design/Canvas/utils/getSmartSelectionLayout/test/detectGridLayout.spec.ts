// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { detectGridLayout } from '../detectGridLayout';

const cell = (id: string, x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

const buildCleanGrid = (): TSmartSelectionNode[] => [cell('a', 0, 0), cell('b', 100, 0), cell('c', 0, 100), cell('d', 100, 100)];

describe('detectGridLayout', () => {
  it('should detect a clean 2x2 grid, with column/row gaps and a full cell matrix', () => {
    const layout = detectGridLayout(buildCleanGrid(), 4, 4);

    expect(layout?.type).toBe('grid');
    expect(layout?.rowCount).toBe(2);
    expect(layout?.columnCount).toBe(2);
    expect(layout?.cells.map((row) => row.map((n) => n.id))).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
    expect(layout?.columnGaps.map((gap) => gap.value)).toEqual([50, 50]);
    expect(layout?.rowGaps.map((gap) => gap.value)).toEqual([50]);
  });

  it('should reject a ragged grid missing one cell', () => {
    const nodes = [
      cell('a', 0, 0),
      cell('b', 100, 0),
      cell('c', 200, 0),
      cell('d', 0, 100),
      cell('e', 100, 100),
      cell('f', 200, 100),
      cell('g', 0, 200),
      cell('h', 100, 200),
    ];

    expect(detectGridLayout(nodes, 4, 4)).toBeNull();
  });

  it('should reject a grid whose columns are misaligned beyond tolerance', () => {
    const nodes = buildCleanGrid();

    nodes[2] = cell('c', 30, 100);

    expect(detectGridLayout(nodes, 4, 4)).toBeNull();
  });

  it('should reject non-uniform column gaps', () => {
    const nodes = [cell('a', 0, 0), cell('b', 100, 0), cell('c', 400, 0), cell('d', 0, 100), cell('e', 100, 100), cell('f', 400, 100)];

    expect(detectGridLayout(nodes, 4, 4)).toBeNull();
  });

  it('should reject non-uniform row gaps', () => {
    const nodes = [cell('a', 0, 0), cell('b', 100, 0), cell('c', 0, 100), cell('d', 100, 100), cell('e', 0, 500), cell('f', 100, 500)];

    expect(detectGridLayout(nodes, 4, 4)).toBeNull();
  });
});
