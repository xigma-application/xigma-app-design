// types
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { rotateSnapshotPoint } from '../rotateSnapshotPoint';

describe('rotateSnapshotPoint', () => {
  it('should leave the point unchanged when the delta is zero', () => {
    // mock
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 0,
      facesByPaint: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };

    // result
    expect(rotateSnapshotPoint({ x: 10, y: 5 }, snapshot)).toEqual({ x: 10, y: 5 });
  });

  it('should rotate the point around the pivot by deltaDegrees', () => {
    // mock — a 90° turn around (0,0): (10,0) -> (0,10)
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 90,
      facesByPaint: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };

    // before
    const result = rotateSnapshotPoint({ x: 10, y: 0 }, snapshot);

    // result
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(10);
  });

  it('should rotate around a non-origin pivot', () => {
    // mock — a 90° turn around (100,50): (110,50) is 10 to the right of the pivot -> (100,60)
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 90,
      facesByPaint: [],
      pivot: { x: 100, y: 50 },
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };

    // before
    const result = rotateSnapshotPoint({ x: 110, y: 50 }, snapshot);

    // result
    expect(result.x).toBeCloseTo(100);
    expect(result.y).toBeCloseTo(60);
  });
});
