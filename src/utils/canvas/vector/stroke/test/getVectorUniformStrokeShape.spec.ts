// utils
import { getVectorUniformStrokeShape } from '../getVectorUniformStrokeShape';
import { makeSquareVector } from './fixtures';

describe('getVectorUniformStrokeShape', () => {
  it('should outline every stroke path at the plain stroke width', () => {
    // before
    const shape = getVectorUniformStrokeShape(makeSquareVector());

    // result
    expect(shape).toHaveLength(1);
    expect(shape?.[0].polygons.length).toBeGreaterThan(0);
  });

  it('should return nothing for a vector without paths', () => {
    // result
    expect(getVectorUniformStrokeShape(makeSquareVector({ segments: {}, vertices: {} }))).toBeNull();
  });
});
