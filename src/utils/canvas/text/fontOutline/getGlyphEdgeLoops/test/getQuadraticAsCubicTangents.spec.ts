// utils
import { getQuadraticAsCubicTangents } from '../getQuadraticAsCubicTangents';

describe('getQuadraticAsCubicTangents', () => {
  it('should place each cubic tangent 2/3 of the way from its endpoint towards the quadratic control point', () => {
    // action
    const { tangentEnd, tangentStart } = getQuadraticAsCubicTangents({ x: 0, y: 0 }, { x: 12, y: 0 }, { x: 6, y: 9 });

    // result
    expect(tangentStart).toEqual({ x: 4, y: 6 });
    expect(tangentEnd).toEqual({ x: -4, y: 6 });
  });

  it('should return zero tangents when the control point sits on both endpoints', () => {
    // action
    const { tangentEnd, tangentStart } = getQuadraticAsCubicTangents({ x: 5, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 5 });

    // result
    expect(tangentStart).toEqual({ x: 0, y: 0 });
    expect(tangentEnd).toEqual({ x: 0, y: 0 });
  });
});
