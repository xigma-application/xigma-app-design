// types
import { TPoint } from 'types/canvas';
import { TNodeFace } from '../types';

// utils
import { getBounds } from '../getBounds';
import { getContainingFace } from '../getContainingFace';

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];
const reversed = (points: TPoint[]): TPoint[] => [...points].reverse();
const face = (points: TPoint[], key: string, sign: number): TNodeFace => ({ bounds: getBounds(points), key, points, sign });

describe('getContainingFace', () => {
  it('should find an opposite-wound, nested face as a real hole’s container — the "o" counter case', () => {
    const outer = face(square(0, 0, 100), 'outer', 1);
    const hole = face(reversed(square(20, 20, 10)), 'hole', -1);

    expect(getContainingFace(hole, [outer, hole])).toBe(outer);
  });

  it('should NOT treat a same-direction nested face as a hole — the "A" crossbar case', () => {
    const outer = face(square(0, 0, 100), 'outer', 1);
    const crossbar = face(square(20, 20, 10), 'crossbar', 1);

    expect(getContainingFace(crossbar, [outer, crossbar])).toBeNull();
  });

  it('should pick the smallest of several valid opposite-wound containers', () => {
    const outer = face(square(0, 0, 100), 'outer', 1);
    const middle = face(reversed(square(10, 10, 50)), 'middle', -1);
    const inner = face(square(20, 20, 10), 'inner', 1);

    expect(getContainingFace(inner, [outer, middle, inner])).toBe(middle);
  });

  it('should keep the running-smallest container when a later, larger opposite-wound candidate also contains the face', () => {
    // mock — large and extra both contain inner, but extra is bigger than the true (medium) container,
    // so the reduce must not let it replace medium as the running-smallest candidate
    const large = face(reversed(square(0, 0, 100)), 'large', -1);
    const medium = face(reversed(square(10, 10, 50)), 'medium', -1);
    const extra = face(reversed(square(5, 5, 70)), 'extra', -1);
    const inner = face(square(20, 20, 10), 'inner', 1);

    expect(getContainingFace(inner, [large, medium, extra, inner])).toBe(medium);
  });

  it('should exclude itself and any candidate that isn’t strictly larger in area', () => {
    const a = face(square(0, 0, 10), 'a', 1);
    const sameAreaOpposite = face(reversed(square(0, 0, 10)), 'b', -1);

    expect(getContainingFace(a, [a, sameAreaOpposite])).toBeNull();
  });
});
