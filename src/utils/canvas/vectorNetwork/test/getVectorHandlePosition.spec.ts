// utils
import { getVectorHandlePosition } from '../getVectorHandlePosition';

describe('getVectorHandlePosition', () => {
  it('should return null when the tangent is null', () => {
    // result
    expect(getVectorHandlePosition({ x: 5, y: 5 }, null)).toBeNull();
  });

  it('should return the vertex plus the tangent offset when the tangent is set', () => {
    // result
    expect(getVectorHandlePosition({ x: 5, y: 5 }, { x: 2, y: -3 })).toEqual({ x: 7, y: 2 });
  });
});
