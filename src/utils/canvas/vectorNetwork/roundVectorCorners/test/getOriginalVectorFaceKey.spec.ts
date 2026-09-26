// utils
import { getOriginalVectorFaceKey } from '../getOriginalVectorFaceKey';

describe('getOriginalVectorFaceKey', () => {
  it('should drop the corner arcs from a face key', () => {
    // result
    expect(getOriginalVectorFaceKey('a~corner,s1,s2,v~corner')).toBe('s1,s2');
  });
});
