// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { getPolygonWorldPoints } from '../getPolygonWorldPoints';

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fills: [],
  flipX: false,
  flipY: false,
  height: 100,
  id: 'p',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 3,
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getPolygonWorldPoints', () => {
  it('should put the first corner of a triangle at the top centre', () => {
    // before
    const points = getPolygonWorldPoints(polygon());

    // result
    expect(points).toHaveLength(3);
    expect(points[0].x).toBeCloseTo(50);
    expect(points[0].y).toBeCloseTo(0);
  });

  it('should flip the outline vertically', () => {
    // before
    const points = getPolygonWorldPoints(polygon({ flipY: true }));

    // result
    expect(points[0].y).toBeCloseTo(100);
  });

  it('should turn the outline around its centre', () => {
    // before
    const points = getPolygonWorldPoints(polygon({ rotation: 180 }));

    // result
    expect(points[0].x).toBeCloseTo(50);
    expect(points[0].y).toBeCloseTo(100);
  });

  it('should round the corners with more points', () => {
    // result
    expect(getPolygonWorldPoints(polygon({ cornerRadius: 10 })).length).toBeGreaterThan(3);
  });
});
