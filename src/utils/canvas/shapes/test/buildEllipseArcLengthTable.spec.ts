// utils
import { buildEllipseArcLengthTable } from '../buildEllipseArcLengthTable';

describe('buildEllipseArcLengthTable', () => {
  it('should return segments + 1 samples starting at zero cumulative length', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 200, 8);

    // result
    expect(table).toHaveLength(9);
    expect(table[0]).toEqual({ angle: 0, cumulativeLength: 0 });
  });

  it('should produce monotonically non-decreasing cumulative lengths', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 100, 36);

    // result
    expect(table.every((sample, index) => index === 0 || sample.cumulativeLength >= table[index - 1].cumulativeLength)).toBe(true);
  });

  it('should approximate the circumference of a circle as 2 * pi * radius', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 200);
    const circumference = table[table.length - 1].cumulativeLength;

    // result
    expect(circumference).toBeCloseTo(2 * Math.PI * 100, 1);
  });

  it('should return an all-zero table for a degenerate zero-size ellipse', () => {
    // before
    const table = buildEllipseArcLengthTable(0, 0, 4);

    // result
    expect(table.every((sample) => sample.cumulativeLength === 0)).toBe(true);
  });
});
