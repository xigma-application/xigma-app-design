// utils
import { getShapeCornerRadii } from '../getShapeCornerRadii';
import { makeEllipse } from '../../../../../Arc/hooks/utils/test/fixtures';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getShapeCornerRadii', () => {
  it('should return the one radius of a shape, 0 without one', () => {
    // result
    expect(getShapeCornerRadii(makeEllipse({ cornerRadius: 4 }))).toEqual([4]);
    expect(getShapeCornerRadii(makeEllipse())).toEqual([0]);
  });

  it('should return the radius of every point of a vector', () => {
    // mock
    const vector = makeSquareVector({ cornerRadius: 2 });
    const [vertexId] = Object.keys(vector.vertices);

    // result
    expect(getShapeCornerRadii({ ...vector, cornerRadiusByVertexId: { [vertexId]: 5 } }).sort()).toEqual([2, 2, 2, 5]);
  });
});
