// utils
import { getScaleAxisAnchors } from '../getScaleAxisAnchors';

const ORIGIN = { height: 100, width: 100, x: 0, y: 0 };

describe('getScaleAxisAnchors', () => {
  it('should anchor an edge handle at the opposite edge, centered on the untouched axis', () => {
    // result
    expect(getScaleAxisAnchors('e', ORIGIN)).toEqual({ x: 0, y: 50 });
    expect(getScaleAxisAnchors('w', ORIGIN)).toEqual({ x: 100, y: 50 });
    expect(getScaleAxisAnchors('n', ORIGIN)).toEqual({ x: 50, y: 100 });
    expect(getScaleAxisAnchors('s', ORIGIN)).toEqual({ x: 50, y: 0 });
  });

  it('should anchor the opposite corner on both axes for each corner handle, same as a plain resize', () => {
    // result
    expect(getScaleAxisAnchors('nw', ORIGIN)).toEqual({ x: 100, y: 100 });
    expect(getScaleAxisAnchors('ne', ORIGIN)).toEqual({ x: 0, y: 100 });
    expect(getScaleAxisAnchors('se', ORIGIN)).toEqual({ x: 0, y: 0 });
    expect(getScaleAxisAnchors('sw', ORIGIN)).toEqual({ x: 100, y: 0 });
  });
});
