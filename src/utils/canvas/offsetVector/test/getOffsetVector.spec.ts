// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TLineNode, TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { getOffsetVector } from '../getOffsetVector';

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

const line: TLineNode = {
  height: 0,
  id: 'line',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
};

describe('getOffsetVector', () => {
  it('should turn a line into its offset vector under the line id', () => {
    // before
    const vector = getOffsetVector(line, 10, StrokeJoin.miter);

    // result
    expect(vector).toMatchObject({ id: 'line', type: NodeType.vector });
  });

  it('should turn a polygon into its filled offset vector', () => {
    // before
    const vector = getOffsetVector(polygon(), 10, StrokeJoin.miter);

    // result
    expect(vector).toMatchObject({ defaultFill: fills, id: 'polygon' });
  });

  it('should turn a star into its filled offset vector', () => {
    // mock
    const star: TStarNode = { ...polygon({ id: 'star' }), points: 5, ratio: 0.5, type: NodeType.star };

    // before
    const vector = getOffsetVector(star, 10, StrokeJoin.miter);

    // result
    expect(vector).toMatchObject({ defaultFill: fills, id: 'star' });
    expect(Object.keys(vector.vertices)).toHaveLength(10);
  });

  it('should reuse the vector for the same node, distance and join and rebuild it otherwise', () => {
    // mock
    const node = polygon();
    const first = getOffsetVector(node, 10, StrokeJoin.miter);

    // result
    expect(getOffsetVector(node, 10, StrokeJoin.miter)).toBe(first);
    expect(getOffsetVector(node, 12, StrokeJoin.miter)).not.toBe(first);
    expect(getOffsetVector(node, 12, StrokeJoin.round)).not.toBe(getOffsetVector(node, 12, StrokeJoin.miter));
  });
});
