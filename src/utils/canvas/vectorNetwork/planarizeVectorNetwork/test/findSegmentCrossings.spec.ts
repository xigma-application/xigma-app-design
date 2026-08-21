// utils
import { findSegmentCrossings } from '../findSegmentCrossings';

describe('findSegmentCrossings', () => {
  it('should find exactly one crossing between two single-sub-edge polylines that cross', () => {
    // result
    expect(
      findSegmentCrossings(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        [
          { x: 50, y: -50 },
          { x: 50, y: 50 },
        ],
      ),
    ).toEqual([{ point: { x: 50, y: 0 }, tA: 0.5, tB: 0.5 }]);
  });

  it('should return an empty array when the two polylines never cross', () => {
    // result
    expect(
      findSegmentCrossings(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        [
          { x: 0, y: 100 },
          { x: 100, y: 100 },
        ],
      ),
    ).toEqual([]);
  });

  it('should convert a crossing on a later sub-edge into the correct GLOBAL t along the whole polyline', () => {
    // mock — pointsA has 2 sub-edges (0,0)->(50,0)->(100,0); the crossing lands on the SECOND sub-edge
    // (local index 1, local t 0.5), which must resolve to global tA = (1+0.5)/2 = 0.75
    // result
    expect(
      findSegmentCrossings(
        [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 100, y: 0 },
        ],
        [
          { x: 75, y: -50 },
          { x: 75, y: 50 },
        ],
      ),
    ).toEqual([{ point: { x: 75, y: 0 }, tA: 0.75, tB: 0.5 }]);
  });
});
