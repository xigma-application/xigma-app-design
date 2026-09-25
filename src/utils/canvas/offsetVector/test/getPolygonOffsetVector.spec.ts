// types
import { NodeType, StrokeAlign, StrokeJoin } from 'types/design/enums';
import { TPolygonNode, TVectorNode } from 'types/design/types';

// utils
import { getPolygonOffsetVector } from '../getPolygonOffsetVector';

const fills = [{ color: '#d9d9d9', opacity: 100, type: 'solid' as const }];

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fills,
  flipX: false,
  flipY: false,
  height: 100,
  id: 'polygon',
  name: 'Polygon',
  parentId: 'frame',
  rotation: 0,
  sides: 4,
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const getXRange = (vector: TVectorNode): [number, number] => {
  const xs = Object.values(vector.vertices).map(({ x }) => x);
  return [Math.min(...xs), Math.max(...xs)];
};

describe('getPolygonOffsetVector', () => {
  it('should push every side out by the distance with sharp corners and keep the fill', () => {
    // before
    const vector = getPolygonOffsetVector(polygon(), 10, StrokeJoin.miter);

    // result
    expect(vector).toMatchObject({
      defaultFill: fills,
      id: 'polygon',
      name: 'Vector',
      parentId: 'frame',
      rotation: 0,
      type: NodeType.vector,
    });
    expect(Object.keys(vector.vertices)).toHaveLength(4);
    expect(getXRange(vector)[0]).toBeCloseTo(-10 * Math.SQRT2);
    expect(vector.filledFaceKeys).toHaveLength(1);
    expect(vector.fillByKey?.[vector.filledFaceKeys[0]]).toBe(fills);
  });

  it('should round the pushed corners with the distance', () => {
    // before
    const vector = getPolygonOffsetVector(polygon(), 10, StrokeJoin.round);

    // result
    expect(Object.values(vector.segments).some((segment) => segment.tangentStart !== null)).toBe(true);
  });

  it('should grow rounded corners by the distance whatever the join', () => {
    // before
    const sharp = getPolygonOffsetVector(polygon({ cornerRadius: 5 }), 10, StrokeJoin.miter);

    // result
    expect(Object.values(sharp.segments).some((segment) => segment.tangentStart !== null)).toBe(true);
  });

  it('should keep the polygon outline at distance 0 and carry its stroke over', () => {
    // before
    const vector = getPolygonOffsetVector(
      polygon({ strokeAlign: StrokeAlign.outside, strokeWidth: 2, strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }] }),
      0,
      StrokeJoin.miter,
    );

    // result
    expect(getXRange(vector)[0]).toBeCloseTo(0);
    expect(vector).toMatchObject({ strokeAlign: StrokeAlign.outside, strokeColor: '#ff0000', strokeWidth: 2 });
  });

  it('should follow a flipped and turned polygon', () => {
    // before
    const vector = getPolygonOffsetVector(polygon({ flipX: true, rotation: 45 }), 0, StrokeJoin.miter);

    // result
    expect(getXRange(vector)[0]).toBeCloseTo(50 - 50 / Math.SQRT2);
  });

  it('should keep the outline of a polygon without size that cannot be offset', () => {
    // before
    const vector = getPolygonOffsetVector(polygon({ height: 0, width: 0 }), 10, StrokeJoin.miter);

    // result
    expect(getXRange(vector)).toEqual([0, 0]);
  });
});
