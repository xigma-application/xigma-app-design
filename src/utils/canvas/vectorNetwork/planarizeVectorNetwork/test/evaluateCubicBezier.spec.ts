// utils
import { evaluateCubicBezier } from '../evaluateCubicBezier';

describe('evaluateCubicBezier', () => {
  it('should linearly interpolate when neither tangent is set (a straight segment)', () => {
    // result
    expect(evaluateCubicBezier({ x: 0, y: 0 }, { x: 100, y: 200 }, null, null, 0.25)).toEqual({ x: 25, y: 50 });
  });

  it('should return the exact start point at t=0 and the exact end point at t=1 for a curved segment', () => {
    // mock
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };
    const tangentStart = { x: 0, y: 100 };
    const tangentEnd = { x: 0, y: -100 };

    // result
    expect(evaluateCubicBezier(start, end, tangentStart, tangentEnd, 0)).toEqual(start);
    expect(evaluateCubicBezier(start, end, tangentStart, tangentEnd, 1)).toEqual(end);
  });

  it('should evaluate the exact midpoint of a symmetric S-curve at t=0.5', () => {
    // mock — start(0,0)->end(100,0) with opposing vertical handles, a classic symmetric S-shape whose
    // t=0.5 point sits exactly on the straight line between start and end
    // result
    expect(evaluateCubicBezier({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }, { x: 0, y: -100 }, 0.5)).toEqual({ x: 50, y: 0 });
  });

  it('should treat a missing tangentStart as a control point coincident with start itself, while a real tangentEnd still shapes the curve', () => {
    // mock — only tangentEnd is set; controlStart collapses to "start" itself
    // result
    expect(evaluateCubicBezier({ x: 0, y: 0 }, { x: 100, y: 0 }, null, { x: 0, y: -50 }, 0.5)).toEqual({ x: 50, y: -18.75 });
  });

  it('should treat a missing tangentEnd as a control point coincident with end itself, while a real tangentStart still shapes the curve', () => {
    // mock — only tangentStart is set; controlEnd collapses to "end" itself
    // result
    expect(evaluateCubicBezier({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 50 }, null, 0.5)).toEqual({ x: 50, y: 18.75 });
  });
});
