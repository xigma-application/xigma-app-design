// utils
import { splitCubicBezier } from '../splitCubicBezier';

describe('splitCubicBezier', () => {
  it('should linearly interpolate the split point and keep every tangent null for a fully straight segment', () => {
    // mock — v1(0,0) -> v2(100,0), no tangents at all
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };

    // action
    const split = splitCubicBezier(start, end, null, null, 0.5);

    // result
    expect(split).toEqual({
      firstTangentEnd: null,
      firstTangentStart: null,
      point: { x: 50, y: 0 },
      secondTangentEnd: null,
      secondTangentStart: null,
    });
  });

  it('should De Casteljau-split a fully curved segment into two segments that retrace the original exactly', () => {
    // mock — v1(0,0) -> v2(100,0), tangentStart (5,0), tangentEnd (-5,0); split at the midpoint t=0.5
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };

    // action
    const split = splitCubicBezier(start, end, { x: 5, y: 0 }, { x: -5, y: 0 }, 0.5);

    // result — hand-derived via the standard cubic De Casteljau construction (control points (5,0)/(95,0)):
    // a=(2.5,0), b=(50,0), c=(97.5,0), d=(26.25,0), e=(73.75,0), point=(50,0); the two inner tangents
    // (firstTangentEnd, secondTangentStart) mirror each other exactly, which is what keeps the curve smooth
    // across the split instead of kinking
    expect(split.point).toEqual({ x: 50, y: 0 });
    expect(split.firstTangentStart).toEqual({ x: 2.5, y: 0 });
    expect(split.firstTangentEnd).toEqual({ x: -23.75, y: 0 });
    expect(split.secondTangentStart).toEqual({ x: 23.75, y: 0 });
    expect(split.secondTangentEnd).toEqual({ x: -2.5, y: 0 });
  });

  it('should treat a missing tangentStart as a control point coincident with the start vertex, matching flattenSegment', () => {
    // mock — only tangentEnd is real, tangentStart is null (the "default preview" scenario)
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };

    // action
    const split = splitCubicBezier(start, end, null, { x: -10, y: 0 }, 0.5);

    // result — a=lerp(start,start,t)=start, so firstTangentStart is exactly zero-length -> null;
    // controlEnd=(90,0), b=(45,0), c=(95,0), d=(22.5,0), e=(70,0), point=(46.25,0)
    expect(split.firstTangentStart).toBeNull();
    expect(split.point.x).toBeCloseTo(46.25);
  });

  it('should treat a missing tangentEnd as a control point coincident with the end vertex, matching flattenSegment', () => {
    // mock — only tangentStart is real, tangentEnd is null
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };

    // action
    const split = splitCubicBezier(start, end, { x: 10, y: 0 }, null, 0.5);

    // result — c=lerp(end,end,t)=end, so secondTangentEnd is exactly zero-length -> null
    expect(split.secondTangentEnd).toBeNull();
    expect(split.point.x).toBeCloseTo(53.75);
  });

  it('should return the start vertex itself, with a null firstTangentStart, when splitting at t=0', () => {
    // mock
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };

    // action
    const split = splitCubicBezier(start, end, { x: 5, y: 0 }, { x: -5, y: 0 }, 0);

    // result
    expect(split.point).toEqual(start);
    expect(split.firstTangentStart).toBeNull();
  });

  it('should return the end vertex itself, with a null secondTangentEnd, when splitting at t=1', () => {
    // mock
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };

    // action
    const split = splitCubicBezier(start, end, { x: 5, y: 0 }, { x: -5, y: 0 }, 1);

    // result
    expect(split.point).toEqual(end);
    expect(split.secondTangentEnd).toBeNull();
  });

  it('should keep a non-null offset when only ONE axis lands exactly on zero (a purely vertical tangent handle) — every other test either zeroes both axes at once (t=0/t=1/missing tangent) or neither', () => {
    // mock — start(0,0) -> end(100,0), tangentStart offset purely vertical ((0,10) — x is exactly 0,
    // y is not), so firstTangentStart's own x-offset from "start" lands exactly on 0 while its y-offset
    // doesn't, exercising the x===0 && y===0 check's short-circuit with a real, mixed (not all-zero,
    // not all-nonzero) offset instead
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };

    // action
    const split = splitCubicBezier(start, end, { x: 0, y: 10 }, { x: -5, y: 0 }, 0.5);

    // result — a = lerp(start, controlStart=(0,10), 0.5) = (0,5); offset from start (0,0) is (0,5): x
    // is exactly 0 but y isn't, so this must NOT collapse to null
    expect(split.firstTangentStart).toEqual({ x: 0, y: 5 });
  });
});
