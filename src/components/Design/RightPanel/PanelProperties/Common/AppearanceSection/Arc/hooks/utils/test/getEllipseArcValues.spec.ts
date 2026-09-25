// utils
import { getEllipseArcValues } from '../getEllipseArcValues';
import { makeEllipse } from './fixtures';

describe('getEllipseArcValues', () => {
  it('should read a full ellipse as start 0°, sweep 100% and ratio 0%', () => {
    // result
    expect(getEllipseArcValues(makeEllipse())).toEqual({ ratio: 0, start: 0, sweep: 100 });
  });

  it('should read the start, sweep and ratio the canvas shows for an arc', () => {
    // before
    const values = getEllipseArcValues(makeEllipse({ arcEndAngle: 180, arcRatio: 0.25, arcStartAngle: 120 }));

    // result
    expect(values.start).toBe(30);
    expect(values.sweep).toBeCloseTo(83.33);
    expect(values.ratio).toBe(25);
  });
});
