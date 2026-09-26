// utils
import { getVectorCornerRadii } from '../getVectorCornerRadii';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getVectorCornerRadii', () => {
  it('should return the radius of every given point', () => {
    // mock
    const square = makeSquareVector({ cornerRadius: 4 });
    const [first, second] = Object.keys(square.vertices);

    // result
    expect(getVectorCornerRadii({ ...square, cornerRadiusByVertexId: { [first]: 9 } }, [first, second])).toEqual([9, 4]);
  });

  it('should return the radius of every point of the vector when no point is given', () => {
    // mock
    const square = makeSquareVector({ cornerRadius: 4 });

    // result
    expect(getVectorCornerRadii(square, [])).toEqual([4, 4, 4, 4]);
  });

  it('should return the radius of a vector without points', () => {
    // result
    expect(getVectorCornerRadii(makeSquareVector({ segments: {}, vertices: {} }), [])).toEqual([0]);
  });
});
