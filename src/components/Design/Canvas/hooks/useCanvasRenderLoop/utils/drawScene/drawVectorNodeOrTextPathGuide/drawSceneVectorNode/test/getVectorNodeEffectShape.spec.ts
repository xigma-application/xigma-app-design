// utils
import { getVectorNodeEffectShape } from '../getVectorNodeEffectShape';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getVectorNodeEffectShape', () => {
  it('should build the effect shape of a vector once per node', () => {
    // mock
    const vector = makeSquareVector();

    // before
    const shape = getVectorNodeEffectShape(vector);

    // result
    expect(shape.polygons.length).toBeGreaterThan(0);
    expect(getVectorNodeEffectShape(vector)).toBe(shape);
  });

  it('should build the shape of a rotated vector where it is drawn', () => {
    // before
    const straight = getVectorNodeEffectShape(makeSquareVector()).bounds;
    const turned = getVectorNodeEffectShape(makeSquareVector({ rotation: 45 })).bounds;

    // result
    expect(turned.width).toBeGreaterThan(straight.width);
  });
});
