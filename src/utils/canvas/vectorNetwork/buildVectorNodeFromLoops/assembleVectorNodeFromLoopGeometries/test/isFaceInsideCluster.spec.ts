// types
import { TPoint } from 'types/canvas';
import { TVectorFace } from '../../../deriveVectorFaces/types';

// utils
import { isFaceInsideCluster } from '../isFaceInsideCluster';

const toEdges = (points: TPoint[]): [TPoint, TPoint][] => points.map((point, index) => [point, points[(index + 1) % points.length]]);

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];

const face = { pieceKeys: [], points: square(10, 10, 10) } as unknown as TVectorFace;

describe('isFaceInsideCluster', () => {
  it('should be inside a loop winding either way', () => {
    // result
    expect(isFaceInsideCluster(face, toEdges(square(0, 0, 100)))).toBe(true);
    expect(isFaceInsideCluster(face, toEdges([...square(0, 0, 100)].reverse()))).toBe(true);
  });

  it('should be outside a loop that does not surround the face', () => {
    // result
    expect(isFaceInsideCluster(face, toEdges(square(50, 50, 10)))).toBe(false);
  });

  it('should cancel out two opposite loops around the face', () => {
    // result
    expect(isFaceInsideCluster(face, [...toEdges(square(0, 0, 100)), ...toEdges([...square(5, 5, 50)].reverse())])).toBe(false);
  });
});
