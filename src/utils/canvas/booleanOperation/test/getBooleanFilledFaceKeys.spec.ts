// types
import { TPoint } from 'types/canvas';
import { TVectorFace } from '../../vectorNetwork/deriveVectorFaces/deriveVectorFaces';

// utils
import { getBooleanFilledFaceKeys } from '../getBooleanFilledFaceKeys';

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];

const outer = { pieceKeys: ['b', 'a'], points: square(0, 0, 100) } as TVectorFace;
const inner = { pieceKeys: ['c'], points: square(40, 40, 20) } as TVectorFace;

describe('getBooleanFilledFaceKeys', () => {
  it('should fill a face that is inside the result, and skip a nested face already covered by it', () => {
    // result
    expect(getBooleanFilledFaceKeys([inner, outer], () => true)).toEqual(['a,b']);
  });

  it('should add a nested face as a hole when the result is outside it', () => {
    // mock
    const isInside = (point: TPoint): boolean => !(point.x > 40 && point.x < 60 && point.y > 40 && point.y < 60);

    // result
    expect(getBooleanFilledFaceKeys([outer, inner], isInside)).toEqual(['a,b', 'c']);
  });

  it('should fill nothing when every face is outside the result', () => {
    // result
    expect(getBooleanFilledFaceKeys([outer, inner], () => false)).toEqual([]);
  });
});
