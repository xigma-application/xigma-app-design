// utils
import { getGradientRadiusRatioFromPoint } from '../getGradientRadiusRatioFromPoint';

describe('getGradientRadiusRatioFromPoint', () => {
  const start = { x: 0, y: 0.5 };
  const end = { x: 1, y: 0.5 };

  it('should return 1 when the point sits a full primary-radius away, perpendicular to the axis', () => {
    expect(getGradientRadiusRatioFromPoint(start, end, { x: 0, y: 1.5 })).toBeCloseTo(1, 5);
  });

  it('should return a smaller ratio for a point closer to the center', () => {
    expect(getGradientRadiusRatioFromPoint(start, end, { x: 0, y: 0.9 })).toBeCloseTo(0.4, 5);
  });

  it('should ignore the component of the drag along the primary axis, using only the perpendicular projection', () => {
    expect(getGradientRadiusRatioFromPoint(start, end, { x: 0.5, y: 1.5 })).toBeCloseTo(1, 5);
  });

  it('should return the same magnitude regardless of which perpendicular side is dragged to', () => {
    expect(getGradientRadiusRatioFromPoint(start, end, { x: 0, y: -0.5 })).toBeCloseTo(1, 5);
  });

  it('should clamp to a small minimum instead of collapsing to zero when dragged onto the axis itself', () => {
    expect(getGradientRadiusRatioFromPoint(start, end, { x: 0.5, y: 0.5 })).toBeCloseTo(0.01, 5);
  });

  it('should return 1 when start and end coincide (degenerate axis)', () => {
    expect(getGradientRadiusRatioFromPoint(start, start, { x: 5, y: 5 })).toBe(1);
  });
});
