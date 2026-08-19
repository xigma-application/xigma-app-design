// utils
import { resizeVectorVertices } from '../resizeVectorVertices';

describe('resizeVectorVertices', () => {
  it('should scale each vertex anchor-relatively per axis and round when asked to', () => {
    // before
    const resized = resizeVectorVertices({ v1: { x: 0, y: 0 }, v2: { x: 10, y: 20 } }, { x: 5, y: 2 }, 2, 3, true);

    // result — anchor + (coord - anchor) * scale: v1 -> (5+(0-5)*2, 2+(0-2)*3) = (-5, -4); v2 -> (5+(10-5)*2, 2+(20-2)*3) = (15, 56)
    expect(resized).toEqual({ v1: { id: 'v1', x: -5, y: -4 }, v2: { id: 'v2', x: 15, y: 56 } });
  });

  it('should leave the coordinate untouched on any axis whose anchor is null, and skip rounding when asked to', () => {
    // before
    const resized = resizeVectorVertices({ v1: { x: 1.4, y: 1.6 } }, { x: null, y: 0 }, 2, 2, false);

    // result — x untouched (anchor null), y = 0 + (1.6 - 0) * 2 = 3.2, left unrounded
    expect(resized).toEqual({ v1: { id: 'v1', x: 1.4, y: 3.2 } });
  });
});
