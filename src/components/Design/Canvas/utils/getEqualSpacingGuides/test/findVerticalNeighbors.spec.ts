// utils
import { findVerticalNeighbors } from '../findVerticalNeighbors';
import { getEdges } from '../../getDistanceGuides/getEdges';

const ACTIVE = getEdges({ height: 100, width: 100, x: 0, y: 100 });

describe('findVerticalNeighbors', () => {
  it('should find the neighbor immediately above and below', () => {
    // before
    const { bottom, top } = findVerticalNeighbors(ACTIVE, [
      { bounds: { height: 80, width: 100, x: 0, y: 0 } },
      { bounds: { height: 50, width: 100, x: 0, y: 220 } },
    ]);

    // result
    expect(top).toEqual(getEdges({ height: 80, width: 100, x: 0, y: 0 }));
    expect(bottom).toEqual(getEdges({ height: 50, width: 100, x: 0, y: 220 }));
  });

  it('should pick the nearest candidate on each side, not the farthest', () => {
    // before
    const { bottom, top } = findVerticalNeighbors(ACTIVE, [
      { bounds: { height: 40, width: 100, x: 0, y: -100 } },
      { bounds: { height: 40, width: 100, x: 0, y: 0 } },
      { bounds: { height: 40, width: 100, x: 0, y: 200 } },
      { bounds: { height: 40, width: 100, x: 0, y: 300 } },
    ]);

    // result
    expect(top).toEqual(getEdges({ height: 40, width: 100, x: 0, y: 0 }));
    expect(bottom).toEqual(getEdges({ height: 40, width: 100, x: 0, y: 200 }));
  });

  it('should ignore a candidate with no horizontal overlap', () => {
    // before — sits above on the y axis, but entirely to the right on the x axis
    const { top } = findVerticalNeighbors(ACTIVE, [{ bounds: { height: 40, width: 20, x: 500, y: 0 } }]);

    // result
    expect(top).toBeNull();
  });

  it('should return null on both sides when there are no candidates', () => {
    // before
    const { bottom, top } = findVerticalNeighbors(ACTIVE, []);

    // result
    expect(top).toBeNull();
    expect(bottom).toBeNull();
  });
});
