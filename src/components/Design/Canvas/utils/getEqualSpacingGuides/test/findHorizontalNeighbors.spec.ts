// utils
import { findHorizontalNeighbors } from '../findHorizontalNeighbors';
import { getEdges } from '../../getDistanceGuides/getEdges';

const ACTIVE = getEdges({ height: 20, width: 20, x: 100, y: 0 });

describe('findHorizontalNeighbors', () => {
  it('should return the nearest candidate on each side', () => {
    // mock — a farther and a nearer candidate on each side
    const nearLeft = { bounds: { height: 20, width: 20, x: 60, y: 0 } };
    const farLeft = { bounds: { height: 20, width: 20, x: 0, y: 0 } };
    const nearRight = { bounds: { height: 20, width: 20, x: 140, y: 0 } };
    const farRight = { bounds: { height: 20, width: 20, x: 200, y: 0 } };

    // action
    const neighbors = findHorizontalNeighbors(ACTIVE, [farLeft, nearLeft, farRight, nearRight], 4);

    // result
    expect(neighbors.left).toBe(nearLeft);
    expect(neighbors.right).toBe(nearRight);
  });

  it('should ignore a candidate with no overlap on the perpendicular axis', () => {
    // mock — sits to the left in x, but far below in y — no vertical overlap
    const candidate = { bounds: { height: 20, width: 20, x: 60, y: 200 } };

    // action
    const neighbors = findHorizontalNeighbors(ACTIVE, [candidate], 4);

    // result
    expect(neighbors).toEqual({ left: null, right: null });
  });

  it('should return nulls when there are no candidates', () => {
    // action
    const neighbors = findHorizontalNeighbors(ACTIVE, [], 4);

    // result
    expect(neighbors).toEqual({ left: null, right: null });
  });

  it('should still register a candidate whose raw position overlaps active by up to the tolerance', () => {
    // mock — right edge at 102, 2px past active.left (100) — a live drag routinely overshoots like this
    const overlapping = { bounds: { height: 20, width: 20, x: 82, y: 0 } };

    // action
    const neighbors = findHorizontalNeighbors(ACTIVE, [overlapping], 4);

    // result
    expect(neighbors.left).toBe(overlapping);
  });

  it('should not register a candidate that overlaps active by more than the tolerance', () => {
    // mock — right edge at 110, 10px past active.left (100) — well beyond the 4px tolerance
    const overlapping = { bounds: { height: 20, width: 20, x: 90, y: 0 } };

    // action
    const neighbors = findHorizontalNeighbors(ACTIVE, [overlapping], 4);

    // result
    expect(neighbors).toEqual({ left: null, right: null });
  });
});
