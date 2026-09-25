// types
import { StrokeMode } from 'types/design/enums';

// utils
import { getVectorPathStrokeShape } from '../getVectorPathStrokeShape';
import { makeSquareVector } from './fixtures';

const loop = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
];

describe('getVectorPathStrokeShape', () => {
  it('should draw a closed path as a ring in the stroke mode', () => {
    // before
    const shape = getVectorPathStrokeShape(makeSquareVector({ strokeMode: StrokeMode.dynamic }), { closed: true, points: loop }, 'dynamic');

    // result
    expect(shape.fillRule).toBe('evenOdd');
    expect(shape.polygons.length).toBeGreaterThan(0);
  });

  it('should fall back to a plain ring when the closed path mode draws nothing', () => {
    // before
    const shape = getVectorPathStrokeShape(
      makeSquareVector({ strokeDynamicFrequency: 0, strokeMode: StrokeMode.dynamic }),
      { closed: true, points: loop },
      'dynamic',
    );

    // result
    expect(shape).toMatchObject({ fillRule: 'evenOdd' });
    expect(shape.polygons).toHaveLength(2);
  });

  it('should draw an open path along the polyline in the stroke mode', () => {
    // before
    const shape = getVectorPathStrokeShape(makeSquareVector({ strokeMode: StrokeMode.brush }), { closed: false, points: loop }, 'brush');

    // result
    expect(shape.fillRule).toBe('evenOdd');
  });

  it('should fall back to a plain band for an open path the mode cannot draw', () => {
    // before
    const shape = getVectorPathStrokeShape(makeSquareVector({ strokeDynamicFrequency: 0 }), { closed: false, points: loop }, 'dynamic');

    // result
    expect(shape.fillRule).toBe('nonZero');
    expect(shape.polygons).toHaveLength(1);
  });

  it('should fall back to a plain band for an open path without length', () => {
    // before
    const shape = getVectorPathStrokeShape(
      makeSquareVector(),
      {
        closed: false,
        points: [
          { x: 5, y: 5 },
          { x: 5, y: 5 },
        ],
      },
      'dynamic',
    );

    // result
    expect(shape.fillRule).toBe('nonZero');
  });
});
