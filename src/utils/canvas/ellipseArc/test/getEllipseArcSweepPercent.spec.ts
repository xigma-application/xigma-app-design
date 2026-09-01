// utils
import { getEllipseArcSweepPercent } from '../getEllipseArcSweepPercent';

describe('getEllipseArcSweepPercent', () => {
  it('should return null for equal start/end angles — a full, uncut circle stays labeled "Arc" instead of "100%"', () => {
    // result
    expect(getEllipseArcSweepPercent(90, 90)).toBeNull();
  });

  it('should count down from 100% as the first (positive-direction) lap cuts the circle away', () => {
    // result — a quarter cut (90° of 360°) leaves 75% of the circle visible
    expect(getEllipseArcSweepPercent(0, 90)).toBe(75);
    expect(getEllipseArcSweepPercent(0, 270)).toBe(25);
  });

  it('should reach exactly 0% at the fully cut-away point, one full positive-direction lap in', () => {
    // result
    expect(getEllipseArcSweepPercent(0, 360)).toBe(0);
  });

  it('should keep counting NEGATIVE, from 0% to -100%, through the refilling (second) positive-direction lap', () => {
    // result — 90° into the 2nd lap: 25% refilled, but shown negative per this lap's sign flip
    expect(getEllipseArcSweepPercent(0, 450)).toBe(-25);
    expect(getEllipseArcSweepPercent(0, 630)).toBe(-75);
  });

  it('should return null again at exactly two full positive-direction laps — back to the "Arc" full-circle text', () => {
    // result
    expect(getEllipseArcSweepPercent(0, 720)).toBeNull();
  });

  it('should count down from 100% into NEGATIVE percentages when the first lap runs the opposite (negative) direction', () => {
    // result — starting the drag "downward"/negative goes straight into negative percentages
    expect(getEllipseArcSweepPercent(0, -90)).toBe(-75);
    expect(getEllipseArcSweepPercent(0, -270)).toBe(-25);
  });

  it('should reach exactly 0% at the fully cut-away point, one full negative-direction lap in', () => {
    // result
    expect(getEllipseArcSweepPercent(0, -360)).toBe(0);
  });

  it('should flip back to POSITIVE percentages through the refilling (second) negative-direction lap', () => {
    // result
    expect(getEllipseArcSweepPercent(0, -450)).toBe(25);
    expect(getEllipseArcSweepPercent(0, -630)).toBe(75);
  });

  it('should return null again at exactly two full negative-direction laps — back at the base "Arc" state', () => {
    // result
    expect(getEllipseArcSweepPercent(0, -720)).toBeNull();
  });

  it('should work the same way regardless of the fixed arcStartAngle offset, going purely off the sweep between the two', () => {
    // result — same 90°-cut shape as the very first case, just rebased off a non-zero start
    expect(getEllipseArcSweepPercent(90, 180)).toBe(75);
  });
});
