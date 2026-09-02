// utils
import { findVerticalNeighbors } from '../findVerticalNeighbors';
import { getEdges } from '../../getDistanceGuides/getEdges';

const ACTIVE = getEdges({ height: 20, width: 20, x: 0, y: 100 });

describe('findVerticalNeighbors', () => {
  it('should return the nearest candidate on each side', () => {
    // mock — a farther and a nearer candidate on each side
    const nearTop = { bounds: { height: 20, width: 20, x: 0, y: 60 } };
    const farTop = { bounds: { height: 20, width: 20, x: 0, y: 0 } };
    const nearBottom = { bounds: { height: 20, width: 20, x: 0, y: 140 } };
    const farBottom = { bounds: { height: 20, width: 20, x: 0, y: 200 } };

    // action
    const neighbors = findVerticalNeighbors(ACTIVE, [farTop, nearTop, farBottom, nearBottom]);

    // result
    expect(neighbors.top).toBe(nearTop);
    expect(neighbors.bottom).toBe(nearBottom);
  });

  it('should ignore a candidate with no overlap on the perpendicular axis', () => {
    // mock — sits above in y, but far right in x — no horizontal overlap
    const candidate = { bounds: { height: 20, width: 20, x: 200, y: 60 } };

    // action
    const neighbors = findVerticalNeighbors(ACTIVE, [candidate]);

    // result
    expect(neighbors).toEqual({ bottom: null, top: null });
  });

  it('should return nulls when there are no candidates', () => {
    // action
    const neighbors = findVerticalNeighbors(ACTIVE, []);

    // result
    expect(neighbors).toEqual({ bottom: null, top: null });
  });
});
