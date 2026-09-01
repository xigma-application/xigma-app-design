// types
import { TPoint } from 'types/canvas';
import { TNodeFace } from '../types';

// utils
import { facesOverlap } from '../facesOverlap';
import { getBounds } from '../getBounds';

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];
const face = (points: TPoint[], key: string): TNodeFace => ({ bounds: getBounds(points), key, points, sign: 1 });

describe('facesOverlap', () => {
  it('should return false for a face compared against itself', () => {
    const a = face(square(0, 0, 10), 'a');

    expect(facesOverlap(a, a)).toBe(false);
  });

  it('should return false when bounding boxes don’t even overlap', () => {
    const a = face(square(0, 0, 10), 'a');
    const b = face(square(100, 100, 10), 'b');

    expect(facesOverlap(a, b)).toBe(false);
  });

  it('should return true when one face is fully nested inside the other', () => {
    const outer = face(square(0, 0, 100), 'outer');
    const inner = face(square(20, 20, 10), 'inner');

    expect(facesOverlap(outer, inner)).toBe(true);
    expect(facesOverlap(inner, outer)).toBe(true);
  });

  it('should return true when neither contains the other but their boundaries genuinely cross — the "D" stem/bowl case', () => {
    const a = face(square(0, 0, 10), 'a');
    const b = face(square(5, 5, 10), 'b');

    expect(facesOverlap(a, b)).toBe(true);
  });
});
