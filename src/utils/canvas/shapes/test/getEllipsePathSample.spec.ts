// utils
import { buildEllipseArcLengthTable } from '../buildEllipseArcLengthTable';
import { getEllipsePathSample } from '../getEllipsePathSample';

describe('getEllipsePathSample', () => {
  it('should return the rightmost point at length 0', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 200);
    const sample = getEllipsePathSample(200, 200, table, 0);

    // result
    expect(sample.x).toBeCloseTo(100);
    expect(sample.y).toBeCloseTo(0);
  });

  it('should reach the bottom of the ellipse at a quarter of the circumference', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 200);
    const circumference = table[table.length - 1].cumulativeLength;
    const sample = getEllipsePathSample(200, 200, table, circumference / 4);

    // result
    expect(sample.x).toBeCloseTo(0, 1);
    expect(sample.y).toBeCloseTo(100, 1);
  });

  it('should wrap a negative length into the valid range', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 200);
    const circumference = table[table.length - 1].cumulativeLength;
    const negative = getEllipsePathSample(200, 200, table, -circumference / 4);
    const positive = getEllipsePathSample(200, 200, table, (3 * circumference) / 4);

    // result
    expect(negative.x).toBeCloseTo(positive.x, 1);
    expect(negative.y).toBeCloseTo(positive.y, 1);
  });

  it('should wrap a length greater than the circumference', () => {
    // before
    const table = buildEllipseArcLengthTable(200, 200);
    const circumference = table[table.length - 1].cumulativeLength;
    const wrapped = getEllipsePathSample(200, 200, table, circumference * 1.5);
    const halfway = getEllipsePathSample(200, 200, table, circumference / 2);

    // result
    expect(wrapped.x).toBeCloseTo(halfway.x, 1);
    expect(wrapped.y).toBeCloseTo(halfway.y, 1);
  });

  it('should default the interpolation fraction to 0 when the bracketing segment has zero length', () => {
    // mock — a malformed table (not from buildEllipseArcLengthTable) with two tied entries at the circumference
    const table = [
      { angle: 0, cumulativeLength: 10 },
      { angle: 1, cumulativeLength: 10 },
    ];

    // result — length 0 never reaches either tied entry, so the search settles on the first with no interpolation span
    const sample = getEllipsePathSample(200, 200, table, 0);

    expect(sample.angleDegrees).toBeCloseTo(90);
    expect(sample.x).toBeCloseTo(100);
    expect(sample.y).toBeCloseTo(0);
  });

  it('should return a fallback zero sample for a degenerate zero-circumference ellipse', () => {
    // before
    const table = buildEllipseArcLengthTable(0, 0, 4);

    // result
    expect(getEllipsePathSample(0, 0, table, 5)).toEqual({ angleDegrees: 0, x: 0, y: 0 });
  });
});
