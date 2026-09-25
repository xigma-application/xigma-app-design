// types
import { TPoint } from 'types/canvas';

// utils
import { getWindingNumber } from '../getWindingNumber';

const square: TPoint[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe('getWindingNumber', () => {
  it('should count a loop once around a point inside it with the sign of its direction', () => {
    // result
    expect(getWindingNumber({ x: 5, y: 5 }, square)).toBe(1);
    expect(getWindingNumber({ x: 5, y: 5 }, [...square].reverse())).toBe(-1);
  });

  it('should give 0 outside the loop', () => {
    // result
    expect(getWindingNumber({ x: 15, y: 5 }, square)).toBe(0);
    expect(getWindingNumber({ x: -5, y: 5 }, square)).toBe(0);
  });
});
