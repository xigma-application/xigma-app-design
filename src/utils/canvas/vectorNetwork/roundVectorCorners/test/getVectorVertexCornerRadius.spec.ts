// utils
import { getVectorVertexCornerRadius } from '../getVectorVertexCornerRadius';

describe('getVectorVertexCornerRadius', () => {
  it('should return the radius of the point when it has its own', () => {
    // result
    expect(getVectorVertexCornerRadius({ cornerRadius: 5, cornerRadiusByVertexId: { a: 0 } }, 'a')).toBe(0);
  });

  it('should fall back to the radius of the vector and then to 0', () => {
    // result
    expect(getVectorVertexCornerRadius({ cornerRadius: 5, cornerRadiusByVertexId: { a: 1 } }, 'b')).toBe(5);
    expect(getVectorVertexCornerRadius({}, 'b')).toBe(0);
  });
});
