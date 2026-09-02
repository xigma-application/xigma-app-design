// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { groupIntoVerticalBands } from '../groupIntoVerticalBands';

const node = (id: string, x: number, y: number, width = 100, height = 100): TSmartSelectionNode => ({
  bounds: { height, width, x, y },
  id,
});

describe('groupIntoVerticalBands', () => {
  it('should group horizontally-overlapping nodes into a single column, sorted top-to-bottom', () => {
    const bands = groupIntoVerticalBands([node('b', 10, 150), node('a', 0, 0)]);

    expect(bands).toEqual([[node('a', 0, 0), node('b', 10, 150)]]);
  });

  it('should split into separate bands, ordered left-to-right, when columns do not overlap', () => {
    const bands = groupIntoVerticalBands([node('right', 200, 0), node('left', 0, 0)]);

    expect(bands.map((band) => band.map((n) => n.id))).toEqual([['left'], ['right']]);
  });

  it('should merge a node into a band via a transitively-overlapping neighbour', () => {
    const bands = groupIntoVerticalBands([node('a', 0, 0, 100, 100), node('b', 50, 150, 100, 100), node('c', 90, 300, 20, 100)]);

    expect(bands.map((band) => band.map((n) => n.id))).toEqual([['a', 'b', 'c']]);
  });
});
