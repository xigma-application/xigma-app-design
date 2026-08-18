// utils
import { getEllipseArcMajorArc } from '../getEllipseArcMajorArc';

describe('getEllipseArcMajorArc', () => {
  it('should treat equal start/end angles as a full, non-degenerate circle', () => {
    // result
    expect(getEllipseArcMajorArc(45, 45)).toEqual({ majorStart: 45, majorSweep: 360 });
  });

  it('should resolve the majority arc for a positive-direction cut', () => {
    // result — cutting 0 -> 90 leaves the remaining 270° filled, anchored at the handle (90)
    expect(getEllipseArcMajorArc(0, 90)).toEqual({ majorStart: 90, majorSweep: 270 });
  });

  it('should resolve the majority arc for a negative-direction cut', () => {
    // result
    expect(getEllipseArcMajorArc(90, 0)).toEqual({ majorStart: 0, majorSweep: -270 });
  });

  it('should collapse to a fully cut-away shape after exactly one full-lap cut', () => {
    // result — an odd cycle count (1 lap): majorSweep collapses to 0, anchored at the fixed start
    expect(getEllipseArcMajorArc(0, 360)).toEqual({ majorStart: 0, majorSweep: 0 });
  });

  it('should un-cut back to a full circle after exactly two full-lap cuts', () => {
    // result — an even cycle count (2 laps): back to a true full circle, anchored at the handle
    expect(getEllipseArcMajorArc(0, 720)).toEqual({ majorStart: 720, majorSweep: 360 });
  });

  it('should anchor a refilling cycle (odd lap count) at the fixed start angle, growing outward from there', () => {
    // result — 1 full lap (360) plus a further 90° cut: refilling, majorSweep is the partial remainder
    expect(getEllipseArcMajorArc(0, 450)).toEqual({ majorStart: 0, majorSweep: 90 });
  });

  it('should anchor a refilling cycle in the negative direction the same way', () => {
    // result
    expect(getEllipseArcMajorArc(0, -450)).toEqual({ majorStart: 0, majorSweep: -90 });
  });
});
