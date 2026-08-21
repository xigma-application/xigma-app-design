// utils
import { getVectorFaceSignedArea } from '../getVectorFaceSignedArea';

describe('getVectorFaceSignedArea', () => {
  it('should return a positive value for a square traced a->b->c->d', () => {
    // result
    expect(
      getVectorFaceSignedArea([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ]),
    ).toBe(20000);
  });

  it('should return the negative of that value for the same square traced in reverse', () => {
    // result
    expect(
      getVectorFaceSignedArea([
        { x: 0, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 0 },
        { x: 0, y: 0 },
      ]),
    ).toBe(-20000);
  });

  it('should return exactly 0 for a degenerate two-point "loop" (an out-and-back over the same line)', () => {
    // result
    expect(
      getVectorFaceSignedArea([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ]),
    ).toBe(0);
  });
});
