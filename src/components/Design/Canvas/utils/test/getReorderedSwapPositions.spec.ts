// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getReorderedSwapPositions } from '../getReorderedSwapPositions';

const slot = (id: string, x: number, y = 0): TSmartSelectionNode => ({ bounds: { height: 50, width: 50, x, y }, id });

describe('getReorderedSwapPositions', () => {
  const slots = [slot('a', 0), slot('b', 100), slot('c', 200), slot('d', 300)];

  it('should move the dragged block forward and shift the blocks it passed back by one slot', () => {
    // a -> slot index 2 (where c sits): [b, c, a, d]
    expect(getReorderedSwapPositions(slots, 0, 2)).toEqual({
      a: { x: 200, y: 0 },
      b: { x: 0, y: 0 },
      c: { x: 100, y: 0 },
    });
  });

  it('should move the dragged block backward and shift the blocks it passed forward by one slot', () => {
    // d -> slot index 1 (where b sits): [a, d, b, c]
    expect(getReorderedSwapPositions(slots, 3, 1)).toEqual({
      b: { x: 200, y: 0 },
      c: { x: 300, y: 0 },
      d: { x: 100, y: 0 },
    });
  });

  it('should return nothing when the block is dropped back on its own slot', () => {
    expect(getReorderedSwapPositions(slots, 1, 1)).toEqual({});
  });

  it('should carry the slot y for column / grid layouts', () => {
    const grid = [slot('a', 0, 0), slot('b', 100, 0), slot('c', 0, 100), slot('d', 100, 100)];

    expect(getReorderedSwapPositions(grid, 0, 3)).toEqual({
      a: { x: 100, y: 100 },
      b: { x: 0, y: 0 },
      c: { x: 100, y: 0 },
      d: { x: 0, y: 100 },
    });
  });
});
