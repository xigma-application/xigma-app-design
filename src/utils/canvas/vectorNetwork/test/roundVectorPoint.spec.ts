// utils
import { roundVectorPoint } from '../roundVectorPoint';

describe('roundVectorPoint', () => {
  it('should round each axis to the nearest half pixel', () => {
    // action
    const point = roundVectorPoint({ x: 10.3, y: 10.7 });

    // result
    expect(point).toEqual({ x: 10.5, y: 10.5 });
  });

  it('should leave a value already on the half-pixel grid unchanged', () => {
    // action
    const point = roundVectorPoint({ x: 5.5, y: -3.5 });

    // result
    expect(point).toEqual({ x: 5.5, y: -3.5 });
  });

  it('should leave a whole-pixel value unchanged', () => {
    // action
    const point = roundVectorPoint({ x: 12, y: -7 });

    // result
    expect(point).toEqual({ x: 12, y: -7 });
  });
});
