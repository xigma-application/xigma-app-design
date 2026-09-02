// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { groupIntoHorizontalBands } from '../groupIntoHorizontalBands';

const node = (id: string, x: number, y: number, width = 100, height = 100): TSmartSelectionNode => ({
  bounds: { height, width, x, y },
  id,
});

describe('groupIntoHorizontalBands', () => {
  it('should group vertically-overlapping nodes into a single row, sorted left-to-right', () => {
    const bands = groupIntoHorizontalBands([node('b', 150, 10), node('a', 0, 0)]);

    expect(bands).toEqual([[node('a', 0, 0), node('b', 150, 10)]]);
  });

  it('should split into separate bands, ordered top-to-bottom, when rows do not overlap', () => {
    const bands = groupIntoHorizontalBands([node('bottom', 0, 200), node('top', 0, 0)]);

    expect(bands.map((band) => band.map((n) => n.id))).toEqual([['top'], ['bottom']]);
  });

  it('should merge a node into a band via a transitively-overlapping neighbour', () => {
    const bands = groupIntoHorizontalBands([node('a', 0, 0, 100, 100), node('b', 150, 50, 100, 100), node('c', 300, 90, 100, 20)]);

    expect(bands.map((band) => band.map((n) => n.id))).toEqual([['a', 'b', 'c']]);
  });
});
