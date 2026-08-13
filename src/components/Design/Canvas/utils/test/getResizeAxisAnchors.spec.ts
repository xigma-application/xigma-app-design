// utils
import { getResizeAxisAnchors } from '../getResizeAxisAnchors';

const ORIGIN = { height: 100, width: 100, x: 0, y: 0 };

describe('getResizeAxisAnchors', () => {
  it('should anchor the opposite edge for each edge handle, leaving the untouched axis null', () => {
    // result
    expect(getResizeAxisAnchors('e', ORIGIN)).toEqual({ x: 0, y: null });
    expect(getResizeAxisAnchors('w', ORIGIN)).toEqual({ x: 100, y: null });
    expect(getResizeAxisAnchors('n', ORIGIN)).toEqual({ x: null, y: 100 });
    expect(getResizeAxisAnchors('s', ORIGIN)).toEqual({ x: null, y: 0 });
  });

  it('should anchor the opposite corner on both axes for each corner handle', () => {
    // result
    expect(getResizeAxisAnchors('nw', ORIGIN)).toEqual({ x: 100, y: 100 });
    expect(getResizeAxisAnchors('ne', ORIGIN)).toEqual({ x: 0, y: 100 });
    expect(getResizeAxisAnchors('se', ORIGIN)).toEqual({ x: 0, y: 0 });
    expect(getResizeAxisAnchors('sw', ORIGIN)).toEqual({ x: 100, y: 0 });
  });
});
