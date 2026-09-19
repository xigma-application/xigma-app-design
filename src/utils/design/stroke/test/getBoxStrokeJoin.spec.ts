// types
import { StrokeJoin } from 'types/design/enums';

// utils
import { getBoxStrokeJoin } from '../getBoxStrokeJoin';

describe('getBoxStrokeJoin', () => {
  it('should keep Miter while the miter angle is below the 90 degree box corner', () => {
    expect(getBoxStrokeJoin(StrokeJoin.miter, undefined)).toBe(StrokeJoin.miter);
    expect(getBoxStrokeJoin(StrokeJoin.miter, 28.96)).toBe(StrokeJoin.miter);
    expect(getBoxStrokeJoin(StrokeJoin.miter, 89.99)).toBe(StrokeJoin.miter);
  });

  it('should fall back to Bevel once the miter angle reaches the 90 degree box corner', () => {
    expect(getBoxStrokeJoin(StrokeJoin.miter, 90)).toBe(StrokeJoin.bevel);
    expect(getBoxStrokeJoin(StrokeJoin.miter, 180)).toBe(StrokeJoin.bevel);
  });

  it('should leave Round and Bevel untouched', () => {
    expect(getBoxStrokeJoin(StrokeJoin.round, 180)).toBe(StrokeJoin.round);
    expect(getBoxStrokeJoin(StrokeJoin.bevel, 10)).toBe(StrokeJoin.bevel);
  });
});
