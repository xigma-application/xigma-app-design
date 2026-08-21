// types
import { TPolylineSegment } from '../getPointAtDistance';

// utils
import { getDashVertices } from '../getDashVertices';

const DASH_LENGTH_PX = 8;
const DASH_GAP_PX = 6;

// a closed 100x100 square, perimeter 400
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

const expectedDashCount = (perimeter: number, zoom: number): number => {
  const patternLength = (DASH_LENGTH_PX + DASH_GAP_PX) / zoom;

  return Math.max(1, Math.round(perimeter / patternLength));
};

describe('getDashVertices', () => {
  it('should return 4 numbers (one x/y pair per endpoint) for each dash', () => {
    // action
    const result = getDashVertices(square, 400, 1, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    const expectedDashes = expectedDashCount(400, 1);

    expect(result).toHaveLength(expectedDashes * 4);
  });

  it('should double the dash count when zoomed in 2x, keeping each dash a constant size on screen', () => {
    // action
    const resultAt1x = getDashVertices(square, 400, 1, DASH_LENGTH_PX, DASH_GAP_PX);
    const resultAt2x = getDashVertices(square, 400, 2, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(resultAt2x.length).toBeGreaterThan(resultAt1x.length);
    expect(resultAt2x).toHaveLength(expectedDashCount(400, 2) * 4);
  });

  it('should leave gaps between dashes instead of tracing a continuous outline', () => {
    // mock — a small square, so a single dash cycle spans a meaningful fraction of its perimeter
    const smallSquare: TPolylineSegment[] = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      [
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      [
        { x: 0, y: 10 },
        { x: 0, y: 0 },
      ],
    ];

    // action
    const result = getDashVertices(smallSquare, 40, 1, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(result[0]).toBeCloseTo(0);
    expect(result[1]).toBeCloseTo(0);

    const dashEnd = { x: result[2], y: result[3] };
    const nextDashStart = { x: result[4], y: result[5] };

    expect(dashEnd).not.toEqual(nextDashStart);
  });

  it('should always draw at least one dash, even when the perimeter is shorter than a single dash+gap cycle', () => {
    // mock — a tiny 4x4 square, perimeter 16, well under one (8+6) pattern length
    const tinySquare: TPolylineSegment[] = [
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
      ],
      [
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ],
      [
        { x: 4, y: 4 },
        { x: 0, y: 4 },
      ],
      [
        { x: 0, y: 4 },
        { x: 0, y: 0 },
      ],
    ];

    // action
    const result = getDashVertices(tinySquare, 16, 1, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(result).toHaveLength(4);
  });
});
