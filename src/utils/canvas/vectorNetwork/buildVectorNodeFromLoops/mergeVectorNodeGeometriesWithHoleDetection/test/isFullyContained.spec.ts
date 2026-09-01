// types
import { TPoint } from 'types/canvas';
import { TNodeFace } from '../types';

// utils
import { getBounds } from '../getBounds';
import { isFullyContained } from '../isFullyContained';

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];

const face = (points: TPoint[], key = 'k', sign = 1): TNodeFace => ({ bounds: getBounds(points), key, points, sign });

describe('isFullyContained', () => {
  it('should return true when every vertex of the face sits inside the container', () => {
    expect(isFullyContained(face(square(20, 20, 10)), face(square(0, 0, 100)))).toBe(true);
  });

  it('should return false when the face pokes outside the container', () => {
    expect(isFullyContained(face(square(90, 90, 20)), face(square(0, 0, 100)))).toBe(false);
  });

  it('should return false for an elongated shape whose single interior point could misleadingly land inside, but most of it sticks out — the "Q tail" case', () => {
    const ring = face(square(0, 0, 20));
    const tail = face([
      { x: 18, y: 9 },
      { x: 18, y: 11 },
      { x: 200, y: 11 },
      { x: 200, y: 9 },
    ]);

    expect(isFullyContained(tail, ring)).toBe(false);
  });
});
