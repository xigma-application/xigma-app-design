// utils
import { rotateVectorVertices } from '../rotateVectorVertices';

describe('rotateVectorVertices', () => {
  it('should rotate every vertex origin around the pivot and round it', () => {
    // result
    expect(rotateVectorVertices({ a: { x: 10, y: 0 } }, { x: 0, y: 0 }, 90)).toEqual({ a: { id: 'a', x: 0, y: 10 } });
  });
});
