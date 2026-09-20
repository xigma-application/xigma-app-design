// utils
import { concatFloat32Arrays } from '../concatFloat32Arrays';

describe('concatFloat32Arrays', () => {
  it('should join the arrays in order into one', () => {
    // result
    expect(concatFloat32Arrays([new Float32Array([1, 2]), new Float32Array([3])])).toEqual(new Float32Array([1, 2, 3]));
  });

  it('should return an empty array for no input', () => {
    // result
    expect(concatFloat32Arrays([])).toEqual(new Float32Array(0));
  });
});
