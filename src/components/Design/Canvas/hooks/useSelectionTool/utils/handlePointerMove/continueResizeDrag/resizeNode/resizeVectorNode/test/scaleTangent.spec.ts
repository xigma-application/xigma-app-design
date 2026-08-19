// utils
import { scaleTangent } from '../scaleTangent';

describe('scaleTangent', () => {
  it('should scale x and y independently by scaleX/scaleY', () => {
    // before
    const scaled = scaleTangent({ x: 2, y: 3 }, 2, 4);

    // result
    expect(scaled).toEqual({ x: 4, y: 12 });
  });

  it('should return null when the tangent is null', () => {
    // before
    const scaled = scaleTangent(null, 2, 4);

    // result
    expect(scaled).toBeNull();
  });
});
