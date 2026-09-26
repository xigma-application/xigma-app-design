// utils
import { getRoundedVectorNode } from '../getRoundedVectorNode';
import { getVectorFillsChange } from 'utils/canvas/vectorNetwork/getVectorFillsChange';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getRoundedVectorNode', () => {
  it('should round a vector with a corner radius once and bake the radius into its shape', () => {
    // mock
    const vector = makeSquareVector({ cornerRadius: 10 });

    // before
    const rounded = getRoundedVectorNode(vector);

    // result
    expect(Object.keys(rounded.segments)).toHaveLength(8);
    expect(rounded.cornerRadius).toBeUndefined();
    expect(getRoundedVectorNode(vector)).toBe(rounded);
  });

  it('should keep the fill on the rounded area so it is drawn with curved corners', () => {
    // mock
    const square = makeSquareVector({ cornerRadius: 10 });
    const filled = { ...square, ...getVectorFillsChange(square, [{ color: '#ff0000', opacity: 100, type: 'solid' }]) };

    // before
    const [group] = groupFilledFacesForRendering(getRoundedVectorNode(filled));

    // result
    expect(group.polygons[0].length).toBeGreaterThan(8);
    expect(group.polygons[0]).not.toContainEqual({ x: 0, y: 0 });
  });

  it('should return the vector itself without a radius or without corners to round', () => {
    // mock
    const plain = makeSquareVector();
    const noCorners = makeSquareVector({ cornerRadius: 10, segments: {}, vertices: {} });

    // result
    expect(getRoundedVectorNode(plain)).toBe(plain);
    expect(getRoundedVectorNode(noCorners)).toBe(noCorners);
  });
});
