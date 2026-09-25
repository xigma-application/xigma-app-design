// types
import { StrokeAlign, StrokeMode, StrokeStyle } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getVectorPathStrokeShape } from '../getVectorPathStrokeShape';
import { makeSquareVector } from './fixtures';

const loop = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
];

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const getMinX = (polygons: TPoint[][]): number => Math.min(...polygons.flat().map(({ x }) => x));

describe('getVectorPathStrokeShape', () => {
  it('should draw a closed path as a ring in the stroke mode', () => {
    // before
    const shape = getVectorPathStrokeShape(
      makeSquareVector({ strokeMode: StrokeMode.dynamic }),
      { closed: true, points: loop },
      'dynamic',
      false,
    );

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
      false,
    );

    // result
    expect(shape).toMatchObject({ fillRule: 'evenOdd' });
    expect(shape.polygons).toHaveLength(2);
  });

  it('should draw an open path along the polyline in the stroke mode', () => {
    // before
    const shape = getVectorPathStrokeShape(
      makeSquareVector({ strokeMode: StrokeMode.brush }),
      { closed: false, points: loop },
      'brush',
      false,
    );

    // result
    expect(shape.fillRule).toBe('evenOdd');
  });

  it('should fall back to a plain band for an open path the mode cannot draw', () => {
    // before
    const shape = getVectorPathStrokeShape(
      makeSquareVector({ strokeDynamicFrequency: 0 }),
      { closed: false, points: loop },
      'dynamic',
      false,
    );

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
      false,
    );

    // result
    expect(shape.fillRule).toBe('nonZero');
  });

  it('should draw a plain ring centred on a closed path', () => {
    // before
    const shape = getVectorPathStrokeShape(makeSquareVector(), { closed: true, points: square }, 'uniform', false);

    // result
    expect(getMinX(shape.polygons)).toBeCloseTo(-5);
  });

  it('should draw a plain band inside a closed path', () => {
    // before
    const shape = getVectorPathStrokeShape(
      makeSquareVector({ strokeAlign: StrokeAlign.inside }),
      { closed: true, points: square },
      'uniform',
      false,
    );

    // result
    expect(shape.polygons).toHaveLength(2);
    expect(getMinX(shape.polygons)).toBeCloseTo(0);
  });

  it('should draw a plain band outside a closed path', () => {
    // before
    const shape = getVectorPathStrokeShape(
      makeSquareVector({ strokeAlign: StrokeAlign.outside }),
      { closed: true, points: square },
      'uniform',
      false,
    );

    // result
    expect(getMinX(shape.polygons)).toBeCloseTo(-10);
  });

  it('should draw the stroke mode around a midline moved inside', () => {
    // before
    const shape = getVectorPathStrokeShape(
      makeSquareVector({ strokeAlign: StrokeAlign.inside, strokeStyle: StrokeStyle.dashed }),
      { closed: true, points: square },
      'dashed',
      false,
    );

    // result
    expect(getMinX(shape.polygons)).toBeGreaterThanOrEqual(-0.001);
  });
});
