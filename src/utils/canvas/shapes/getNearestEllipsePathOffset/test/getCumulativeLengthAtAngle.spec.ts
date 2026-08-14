// utils
import { buildEllipseArcLengthTable } from '../../buildEllipseArcLengthTable';
import { getCumulativeLengthAtAngle } from '../getCumulativeLengthAtAngle';

describe('getCumulativeLengthAtAngle', () => {
  it('should return 0 at angle 0', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 200);

    // result
    expect(getCumulativeLengthAtAngle(0, table)).toBe(0);
  });

  it('should return roughly half the circumference at angle PI, for a circle', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 200);
    const circumference = table[table.length - 1].cumulativeLength;

    // result
    expect(getCumulativeLengthAtAngle(Math.PI, table)).toBeCloseTo(circumference / 2, 0);
  });

  it('should interpolate between two table entries for an angle between samples', () => {
    // mock — two entries spanning angle 0 to 1, cumulative length 0 to 10
    const table = [
      { angle: 0, cumulativeLength: 0 },
      { angle: 1, cumulativeLength: 10 },
    ];

    // result — angle PI falls exactly halfway between the two samples (0 to 2*PI)
    expect(getCumulativeLengthAtAngle(Math.PI, table)).toBe(5);
  });

  it('should clamp to the last entry when the angle reaches the end of the table', () => {
    // mock
    const table = [
      { angle: 0, cumulativeLength: 0 },
      { angle: Math.PI * 2, cumulativeLength: 10 },
    ];

    // result
    expect(getCumulativeLengthAtAngle(Math.PI * 2, table)).toBe(10);
  });
});
