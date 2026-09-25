// types
import { TLineStrokeShape } from 'utils/canvas/line/types';

// utils
import { getLineShape } from '../getLineShape';

const strokeShape: TLineStrokeShape = {
  fillRule: 'nonZero',
  polygons: [
    [
      { x: 0, y: -1 },
      { x: 10, y: -1 },
      { x: 10, y: 1 },
      { x: 0, y: 1 },
    ],
    [
      { x: 10, y: -3 },
      { x: 14, y: 0 },
      { x: 10, y: 3 },
    ],
  ],
};

describe('getLineShape', () => {
  it('should wrap every polygon of the line stroke in an effect shape spanning all of them', () => {
    // before
    const shape = getLineShape(strokeShape);

    // result
    expect(shape.bounds).toEqual({ height: 6, width: 14, x: 0, y: -3 });
    expect(shape.polygons).toBe(strokeShape.polygons);
  });

  it('should reuse the shape for the same stroke shape', () => {
    // result
    expect(getLineShape(strokeShape)).toBe(getLineShape(strokeShape));
  });

  it('should give a new stroke shape a new key', () => {
    // result
    expect(getLineShape({ ...strokeShape }).key).not.toBe(getLineShape({ ...strokeShape }).key);
  });
});
