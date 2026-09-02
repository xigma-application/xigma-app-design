// utils
import { findHorizontalNeighbors } from '../findHorizontalNeighbors';
import { getEdges } from '../../getDistanceGuides/getEdges';

const ACTIVE = getEdges({ height: 100, width: 100, x: 100, y: 0 });

describe('findHorizontalNeighbors', () => {
  it('should find the neighbor immediately to the left and to the right', () => {
    // before
    const { left, right } = findHorizontalNeighbors(ACTIVE, [
      { bounds: { height: 100, width: 80, x: 0, y: 0 } },
      { bounds: { height: 100, width: 50, x: 220, y: 0 } },
    ]);

    // result
    expect(left).toEqual(getEdges({ height: 100, width: 80, x: 0, y: 0 }));
    expect(right).toEqual(getEdges({ height: 100, width: 50, x: 220, y: 0 }));
  });

  it('should pick the nearest candidate on each side, not the farthest', () => {
    // before
    const { left, right } = findHorizontalNeighbors(ACTIVE, [
      { bounds: { height: 100, width: 40, x: -100, y: 0 } },
      { bounds: { height: 100, width: 40, x: 0, y: 0 } },
      { bounds: { height: 100, width: 40, x: 200, y: 0 } },
      { bounds: { height: 100, width: 40, x: 300, y: 0 } },
    ]);

    // result
    expect(left).toEqual(getEdges({ height: 100, width: 40, x: 0, y: 0 }));
    expect(right).toEqual(getEdges({ height: 100, width: 40, x: 200, y: 0 }));
  });

  it('should ignore a candidate with no vertical overlap', () => {
    // before — sits to the left on the x axis, but entirely below on the y axis
    const { left } = findHorizontalNeighbors(ACTIVE, [{ bounds: { height: 20, width: 40, x: 0, y: 500 } }]);

    // result
    expect(left).toBeNull();
  });

  it('should return null on both sides when there are no candidates', () => {
    // before
    const { left, right } = findHorizontalNeighbors(ACTIVE, []);

    // result
    expect(left).toBeNull();
    expect(right).toBeNull();
  });
});
