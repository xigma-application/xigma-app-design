// utils
import { getEllipseArcSweepPercent } from 'utils/canvas/ellipseArc/getEllipseArcSweepPercent';
import { getEllipseArcSweepSpan } from '../getEllipseArcSweepSpan';

describe('getEllipseArcSweepSpan', () => {
  it('should give the angle span the canvas reads back as the same sweep percent', () => {
    // result
    [75, -40, 0].forEach((percent) => {
      expect(getEllipseArcSweepPercent(90, 90 + getEllipseArcSweepSpan(percent))).toBeCloseTo(percent);
    });
  });

  it('should close the ellipse for a full sweep', () => {
    // result
    expect(getEllipseArcSweepSpan(100)).toBe(0);
    expect(getEllipseArcSweepSpan(-100)).toBe(0);
  });
});
