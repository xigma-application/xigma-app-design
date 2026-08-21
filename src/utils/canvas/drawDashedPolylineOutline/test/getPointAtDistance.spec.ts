// utils
import { getPointAtDistance, TPolylineSegment } from '../getPointAtDistance';

// a closed 100x100 square: (0,0) -> (100,0) -> (100,100) -> (0,100) -> back to (0,0), perimeter 400
const square: TPolylineSegment[] = [
  [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  [
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ],
  [
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ],
  [
    { x: 0, y: 100 },
    { x: 0, y: 0 },
  ],
];

describe('getPointAtDistance', () => {
  it('should return the very first point at distance 0', () => {
    // action
    const result = getPointAtDistance(square, 400, 0);

    // result
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('should land partway along the first segment for a distance shorter than it', () => {
    // action
    const result = getPointAtDistance(square, 400, 30);

    // result
    expect(result).toEqual({ x: 30, y: 0 });
  });

  it('should land exactly on a shared vertex when the distance lands exactly on a segment boundary', () => {
    // action
    const result = getPointAtDistance(square, 400, 100);

    // result
    expect(result).toEqual({ x: 100, y: 0 });
  });

  it('should walk past the first segment into the second one for a longer distance', () => {
    // action
    const result = getPointAtDistance(square, 400, 150);

    // result
    expect(result).toEqual({ x: 100, y: 50 });
  });

  it('should wrap a distance greater than the perimeter back around the closed loop', () => {
    // action — 430 wraps to 30, same as landing 30 units into the first segment
    const result = getPointAtDistance(square, 400, 430);

    // result
    expect(result).toEqual({ x: 30, y: 0 });
  });

  it('should wrap a negative distance backward around the closed loop', () => {
    // action — -30 wraps to 370, which is 70 units into the fourth segment ((0,100) -> (0,0))
    const result = getPointAtDistance(square, 400, -30);

    // result
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(30);
  });

  it('should not divide by zero when the target distance lands on a zero-length segment', () => {
    // mock — a repeated point produces a degenerate zero-length segment
    const segmentsWithDuplicatePoint: TPolylineSegment[] = [
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    ];

    // action
    const result = getPointAtDistance(segmentsWithDuplicatePoint, 100, 0);

    // result
    expect(result).toEqual({ x: 0, y: 0 });
  });
});
