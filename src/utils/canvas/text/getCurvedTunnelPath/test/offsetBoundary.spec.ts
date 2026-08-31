// utils
import { offsetBoundary } from '../offsetBoundary';

describe('offsetBoundary', () => {
  it('should shift a straight two-point centerline by a constant perpendicular offset', () => {
    // result
    expect(
      offsetBoundary(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        10,
      ),
    ).toEqual([
      { x: 0, y: 10 },
      { x: 100, y: 10 },
    ]);
  });

  it('should pass an interior vertex straight through unmitered when its two segments run parallel', () => {
    // mock — a(0,0)->b(50,0)->c(100,0): dense samples along one straight run, no real corner
    const boundary = offsetBoundary(
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
      ],
      10,
    );

    // result — every point sits on the same constant-offset line, nothing frozen or dropped
    expect(boundary).toEqual([
      { x: 0, y: 10 },
      { x: 50, y: 10 },
      { x: 50, y: 10 },
      { x: 100, y: 10 },
    ]);
  });

  it('should flare a convex corner out past the vertex, with nothing needing to freeze', () => {
    // mock — a 90° turn a(0,0)->b(100,0)->c(100,100), offset to the convex side
    const boundary = offsetBoundary(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
      -10,
    );

    // result — the miter flares out to (110,-10), further from b than either naive offset
    expect(boundary).toEqual([
      { x: 0, y: -10 },
      { x: 110, y: -10 },
      { x: 110, y: -10 },
      { x: 110, y: 100 },
    ]);
  });

  it('should freeze already-pushed points on the approach side that end up ahead of a concave miter', () => {
    // mock — same 90° turn, but with an extra dense sample (95,0) right before the vertex on the
    // concave side (width 10): its naive offset (95,10) would sit *ahead* of the miter (90,10)
    // along the approach direction — a stray backtrack — instead of freezing onto it
    const boundary = offsetBoundary(
      [
        { x: 0, y: 0 },
        { x: 95, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
      10,
    );

    // result — (0,10) is untouched (never ahead of the miter); the (95,10) sample and the vertex's
    // own pair both collapse onto the miter point (90,10); the array's length is still
    // 2*centerline.length-2, unchanged by the freeze
    expect(boundary).toEqual([
      { x: 0, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 100 },
    ]);
  });

  it('should freeze upcoming points on the departure side that are still behind a concave miter', () => {
    // mock — same 90° turn, extra dense sample (100,5) right after the vertex on the departure
    // segment: its naive offset (90,5) is still *behind* the miter (90,10) along the departure
    // direction, so it freezes onto the miter instead of drawing a stroke back down to it
    const boundary = offsetBoundary(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 5 },
        { x: 100, y: 100 },
      ],
      10,
    );

    expect(boundary).toEqual([
      { x: 0, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 100 },
    ]);
  });

  it('should freeze the very last point onto the miter when the centerline ends before ever making it past that corner', () => {
    // mock — the 90° turn again, but the centerline stops just past the vertex (100,5), still
    // behind the miter (90,10) along the departure direction — there's no later sample to fall
    // back on, so the endpoint itself has to freeze onto the miter
    const boundary = offsetBoundary(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 5 },
      ],
      10,
    );

    expect(boundary).toEqual([
      { x: 0, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 10 },
    ]);
  });

  it('should keep top and bottom boundaries index-aligned at the same centerline even though a corner reshapes each of them differently', () => {
    // mock — the same corner-adjacent centerline offset by two different widths, one deeply
    // concave (many points frozen) and one mildly convex (nothing frozen)
    const centerline = [
      { x: 0, y: 0 },
      { x: 95, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];

    // result
    const concave = offsetBoundary(centerline, 10);
    const convex = offsetBoundary(centerline, -10);

    expect(concave).toHaveLength(convex.length);
    expect(concave).toHaveLength(2 * centerline.length - 2);
  });
});
