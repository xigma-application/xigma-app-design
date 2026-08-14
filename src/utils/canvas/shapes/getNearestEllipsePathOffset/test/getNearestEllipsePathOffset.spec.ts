// utils
import { buildEllipseArcLengthTable } from '../../buildEllipseArcLengthTable';
import { getNearestEllipsePathOffset } from '../getNearestEllipsePathOffset';

describe('getNearestEllipsePathOffset', () => {
  const ellipse = { height: 200, rotation: 0, width: 200, x: 0, y: 0 };

  it('should return offset 0 for a point on the rightmost edge', () => {
    // before
    const table = buildEllipseArcLengthTable(ellipse.width, ellipse.height);
    const result = getNearestEllipsePathOffset({ x: 200, y: 100 }, ellipse, table);

    // result
    expect(result.offset).toBeCloseTo(0, 2);
    expect(result.distance).toBeCloseTo(0, 1);
  });

  it('should return offset around a quarter turn for a point at the bottom', () => {
    // before
    const table = buildEllipseArcLengthTable(ellipse.width, ellipse.height);
    const result = getNearestEllipsePathOffset({ x: 100, y: 200 }, ellipse, table);

    // result
    expect(result.offset).toBeCloseTo(0.25, 2);
  });

  it('should account for ellipse rotation when locating the nearest offset', () => {
    // before
    const table = buildEllipseArcLengthTable(ellipse.width, ellipse.height);
    const rotated = { ...ellipse, rotation: 90 };
    const result = getNearestEllipsePathOffset({ x: 100, y: 200 }, rotated, table);

    // result
    expect(result.offset).toBeCloseTo(0, 2);
  });

  it('should return offset 0 when the arc-length table has zero circumference', () => {
    // mock — a malformed single-entry table (not from buildEllipseArcLengthTable), circumference is 0
    const zeroCircumferenceTable = [{ angle: 0, cumulativeLength: 0 }];

    // before
    const result = getNearestEllipsePathOffset({ x: 200, y: 100 }, ellipse, zeroCircumferenceTable);

    // result
    expect(result.offset).toBe(0);
  });

  it('should fall back to the center point for a degenerate zero-radius ellipse', () => {
    // before
    const degenerate = { height: 0, rotation: 0, width: 0, x: 50, y: 50 };
    const table = buildEllipseArcLengthTable(0, 0, 4);
    const result = getNearestEllipsePathOffset({ x: 80, y: 80 }, degenerate, table);

    // result
    expect(result.offset).toBe(0);
    expect(result.point).toEqual({ x: 50, y: 50 });
  });
});
