// utils
import { computeResizedRect } from '../computeResizedRect';

const ORIGIN = { height: 100, width: 100, x: 0, y: 0 };

describe('computeResizedRect', () => {
  it('should resize from the east edge, leaving the vertical axis untouched', () => {
    // result
    expect(computeResizedRect('e', ORIGIN, { x: 150, y: 500 })).toEqual({ height: 100, width: 150, x: 0, y: 0 });
  });

  it('should resize from the west edge, anchoring the opposite side', () => {
    // result
    expect(computeResizedRect('w', ORIGIN, { x: -20, y: 500 })).toEqual({ height: 100, width: 120, x: -20, y: 0 });
  });

  it('should resize from the south edge, leaving the horizontal axis untouched', () => {
    // result
    expect(computeResizedRect('s', ORIGIN, { x: 500, y: 150 })).toEqual({ height: 150, width: 100, x: 0, y: 0 });
  });

  it('should resize from the north edge, anchoring the opposite side', () => {
    // result
    expect(computeResizedRect('n', ORIGIN, { x: 500, y: -20 })).toEqual({ height: 120, width: 100, x: 0, y: -20 });
  });

  it('should resize from the south-east corner', () => {
    // result
    expect(computeResizedRect('se', ORIGIN, { x: 150, y: 150 })).toEqual({ height: 150, width: 150, x: 0, y: 0 });
  });

  it('should resize from the north-west corner, anchoring the opposite corner', () => {
    // result
    expect(computeResizedRect('nw', ORIGIN, { x: -20, y: -20 })).toEqual({ height: 120, width: 120, x: -20, y: -20 });
  });

  it('should resize from the north-east corner', () => {
    // result
    expect(computeResizedRect('ne', ORIGIN, { x: 150, y: -20 })).toEqual({ height: 120, width: 150, x: 0, y: -20 });
  });

  it('should resize from the south-west corner', () => {
    // result
    expect(computeResizedRect('sw', ORIGIN, { x: -20, y: 150 })).toEqual({ height: 150, width: 120, x: -20, y: 0 });
  });

  it('should clamp the size to MIN_SHAPE_SIZE instead of collapsing or inverting past the opposite edge', () => {
    // result
    expect(computeResizedRect('e', ORIGIN, { x: 1, y: 0 })).toEqual({ height: 100, width: 2, x: 0, y: 0 });
    expect(computeResizedRect('w', ORIGIN, { x: 99, y: 0 })).toEqual({ height: 100, width: 2, x: 98, y: 0 });
  });
});
