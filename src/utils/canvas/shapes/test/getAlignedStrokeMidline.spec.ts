// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getAlignedStrokeMidline } from '../getAlignedStrokeMidline';

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const getMinX = (points: { x: number }[]): number => Math.min(...points.map((point) => point.x));

describe('getAlignedStrokeMidline', () => {
  it('should keep the loop for a centred stroke', () => {
    // result
    expect(getAlignedStrokeMidline(square, 5, StrokeAlign.center, false)).toBe(square);
  });

  it('should move the midline into the shape for an inside stroke and out of it for an outside one', () => {
    // result
    expect(getMinX(getAlignedStrokeMidline(square, 5, StrokeAlign.inside, false))).toBeCloseTo(5);
    expect(getMinX(getAlignedStrokeMidline(square, 5, StrokeAlign.outside, false))).toBeCloseTo(-5);
  });

  it('should move the midline of a hole away from the hole for an inside stroke', () => {
    // result
    expect(getMinX(getAlignedStrokeMidline(square, 5, StrokeAlign.inside, true))).toBeCloseTo(-5);
    expect(getMinX(getAlignedStrokeMidline(square, 5, StrokeAlign.outside, true))).toBeCloseTo(5);
  });

  it('should keep the loop when the shape is too small to move the midline into', () => {
    // result
    expect(getAlignedStrokeMidline(square, 60, StrokeAlign.inside, false)).toBe(square);
    expect(getAlignedStrokeMidline(square, 60, StrokeAlign.outside, true)).toBe(square);
  });
});
