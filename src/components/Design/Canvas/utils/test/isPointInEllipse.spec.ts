// utils
import { isPointInEllipse } from '../isPointInEllipse';

const CIRCLE = { height: 100, width: 100, x: 0, y: 0 };

describe('isPointInEllipse', () => {
  it('should return false for a point outside the outer bound', () => {
    // result
    expect(isPointInEllipse({ x: 100, y: 100 }, CIRCLE)).toBe(false);
  });

  it('should return true anywhere inside a plain full circle (no arc, no ratio)', () => {
    // result
    expect(isPointInEllipse({ x: 50, y: 50 }, CIRCLE)).toBe(true);
  });

  it('should exclude the hollow center of a full-circle ring (no arc, arcRatio > 0)', () => {
    // mock — hole radius is 0.5 * 50 = 25
    const ring = { ...CIRCLE, arcRatio: 0.5 };

    // result
    expect(isPointInEllipse({ x: 60, y: 50 }, ring)).toBe(false); // 10 from center, inside the hole
    expect(isPointInEllipse({ x: 80, y: 50 }, ring)).toBe(true); // 30 from center, inside the band
  });

  it('should return true anywhere inside the outer bound of a fully cut-away shape', () => {
    // mock — a full 360° lap cut (arcStartAngle default 90, arcEndAngle 450) collapses majorSweep to 0
    const node = { ...CIRCLE, arcEndAngle: 450 };

    // result
    expect(isPointInEllipse({ x: 50, y: 50 }, node)).toBe(true);
  });

  it('should return true anywhere inside the outer bound once arcRatio reaches its max (1)', () => {
    // mock — the ring's inner/outer edges coincide, so the sector polygon degenerates
    const node = { ...CIRCLE, arcEndAngle: 90, arcRatio: 1, arcStartAngle: 0 };

    // result
    expect(isPointInEllipse({ x: 50, y: 50 }, node)).toBe(true);
  });

  it('should trace the filled majority arc as a fan from center when arcRatio is 0', () => {
    // mock — majorArc(0, 90) is {majorStart: 90, majorSweep: 270}: the 270° majority is filled
    const node = { ...CIRCLE, arcEndAngle: 90, arcStartAngle: 0 };

    // result
    expect(isPointInEllipse({ x: 32.3223, y: 67.6777 }, node)).toBe(true); // inside the filled 225° bisector
    expect(isPointInEllipse({ x: 67.6777, y: 32.3223 }, node)).toBe(false); // inside the 0-90° cut-away gap
  });

  it('should exclude both the hole and the angular gap for a ring-sector shape (arc + ratio)', () => {
    // mock
    const node = { ...CIRCLE, arcEndAngle: 90, arcRatio: 0.5, arcStartAngle: 0 };

    // result
    expect(isPointInEllipse({ x: 21.7157, y: 78.2843 }, node)).toBe(true); // 40 out, 225° — in the band
    expect(isPointInEllipse({ x: 42.9289, y: 57.0711 }, node)).toBe(false); // 10 out, 225° — inside the hole
    expect(isPointInEllipse({ x: 78.2843, y: 21.7157 }, node)).toBe(false); // 40 out, 45° — in the cut-away gap
  });

  it('should swap which side registers as filled when arcRatioInverted is set', () => {
    // mock — the same ring-sector shape as above, inverted
    const node = { ...CIRCLE, arcEndAngle: 90, arcRatio: 0.5, arcRatioInverted: true, arcStartAngle: 0 };

    // result
    expect(isPointInEllipse({ x: 21.7157, y: 78.2843 }, node)).toBe(false); // was filled, now the gap side
    expect(isPointInEllipse({ x: 78.2843, y: 21.7157 }, node)).toBe(true); // was the gap, now filled
  });

  it('should flip the query point before testing against the sector polygon', () => {
    // mock — flipping the shape mirrors which on-screen point counts as "inside" across the center
    const node = { ...CIRCLE, arcEndAngle: 90, arcStartAngle: 0, flipX: true };

    // result — (67.6777, 32.3223) is the 45° cut-away point in unflipped local space; querying it on
    // a flipX'd shape un-mirrors it back to the filled 315° position before testing
    expect(isPointInEllipse({ x: 67.6777, y: 32.3223 }, node)).toBe(true);
  });
});
