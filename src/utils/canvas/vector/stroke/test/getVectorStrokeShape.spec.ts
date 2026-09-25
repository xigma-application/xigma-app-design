// types
import { StrokeAlign, StrokeMode, StrokeProfile, StrokeStyle } from 'types/design/enums';

// utils
import { getVectorStrokeShape } from '../getVectorStrokeShape';
import { makeNetworkVector, makeSquareVector } from './fixtures';

const loopWithLine = (overrides: Parameters<typeof makeSquareVector>[0]): ReturnType<typeof makeSquareVector> =>
  makeNetworkVector(
    { a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 }, d: { x: 200, y: 0 } },
    [
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'a'],
      ['b', 'd'],
    ],
    overrides,
  );

describe('getVectorStrokeShape', () => {
  it('should draw a closed path in its stroke mode filled even-odd', () => {
    // before
    const shapes = getVectorStrokeShape(makeSquareVector({ strokeMode: StrokeMode.dynamic }));

    // result
    expect(shapes).toHaveLength(1);
    expect(shapes?.[0].fillRule).toBe('evenOdd');
  });

  it('should keep the stroke mode on every path once a line is drawn onto the loop', () => {
    // before
    const shapes = getVectorStrokeShape(loopWithLine({ strokeMode: StrokeMode.brush }));

    // result
    expect(shapes).toHaveLength(2);
    expect(shapes?.every(({ polygons }) => polygons.length > 0)).toBe(true);
  });

  it('should reuse the shape for the same node', () => {
    // mock
    const node = makeSquareVector({ strokeStyle: StrokeStyle.dashed });

    // result
    expect(getVectorStrokeShape(node)).toBe(getVectorStrokeShape(node));
  });

  it('should leave a plain stroke to the regular drawing', () => {
    // result
    expect(getVectorStrokeShape(makeSquareVector())).toBeNull();
    expect(getVectorStrokeShape(makeSquareVector({ strokeProfile: StrokeProfile.uniform, strokeStyle: StrokeStyle.solid }))).toBeNull();
  });

  it('should draw nothing special without a stroke width or any path', () => {
    // result
    expect(getVectorStrokeShape(makeSquareVector({ strokeMode: StrokeMode.brush, strokeWidth: 0 }))).toBeNull();
    expect(getVectorStrokeShape(makeNetworkVector({}, [], { strokeMode: StrokeMode.brush }))).toBeNull();
  });

  it('should draw a plain stroke of a closed path inside it when aligned inside', () => {
    // before
    const shapes = getVectorStrokeShape(makeSquareVector({ strokeAlign: StrokeAlign.inside }));

    // result
    expect(shapes).toHaveLength(1);
    expect(Math.min(...(shapes?.[0].polygons.flat().map(({ x }) => x) ?? []))).toBeCloseTo(0);
  });

  it('should leave a centred plain stroke to the stroke vertices', () => {
    // before
    const shapes = getVectorStrokeShape(makeSquareVector({ strokeAlign: StrokeAlign.center }));

    // result
    expect(shapes).toBeNull();
  });
});
