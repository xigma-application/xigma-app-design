// types
import { TOffsetVectorState } from 'store/design/types';
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TLineNode, TPolygonNode } from 'types/design/types';

// utils
import { getOffsetVectorEdgeAtPoint } from '../getOffsetVectorEdgeAtPoint';

const line: TLineNode = {
  height: 0,
  id: 'line',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
};

const offsetVector: TOffsetVectorState = { distance: 10, join: StrokeJoin.miter, nodeId: 'line' };
const viewport = { x: 0, y: 0, zoom: 1 };

describe('getOffsetVectorEdgeAtPoint', () => {
  it('should find the offset outline next to the point with its outward direction', () => {
    // before
    const below = getOffsetVectorEdgeAtPoint({ x: 50, y: 12 }, line, offsetVector, viewport);
    const above = getOffsetVectorEdgeAtPoint({ x: 50, y: -9 }, line, offsetVector, viewport);

    // result
    expect(below?.point.x).toBeCloseTo(50);
    expect(below?.point.y).toBeCloseTo(10);
    expect(below?.normal.x).toBeCloseTo(0);
    expect(below?.normal.y).toBeCloseTo(1);
    expect(below?.angle).toBeCloseTo(90);
    expect(above?.normal.y).toBeCloseTo(-1);
  });

  it('should miss a point too far from the outline for the zoom', () => {
    // result
    expect(getOffsetVectorEdgeAtPoint({ x: 50, y: 16 }, line, offsetVector, viewport)).toBeNull();
    expect(getOffsetVectorEdgeAtPoint({ x: 50, y: 16 }, line, offsetVector, { ...viewport, zoom: 0.5 })).not.toBeNull();
  });

  it('should point outward along a polygon offset outline whichever way it runs', () => {
    // mock
    const polygon: TPolygonNode = {
      ...line,
      fills: [],
      flipX: false,
      flipY: false,
      height: 100,
      id: 'polygon',
      sides: 4,
      type: NodeType.polygon,
    };

    // before
    const right = getOffsetVectorEdgeAtPoint(
      { x: 108, y: 50 },
      polygon,
      { ...offsetVector, nodeId: 'polygon' },
      { x: 0, y: 0, zoom: 0.25 },
    );

    const flipped = getOffsetVectorEdgeAtPoint(
      { x: 108, y: 50 },
      { ...polygon, flipX: true },
      { ...offsetVector, nodeId: 'polygon' },
      { x: 0, y: 0, zoom: 0.25 },
    );

    // result
    expect(right?.normal.x).toBeGreaterThan(0);
    expect(flipped?.normal.x).toBeGreaterThan(0);
  });
});
