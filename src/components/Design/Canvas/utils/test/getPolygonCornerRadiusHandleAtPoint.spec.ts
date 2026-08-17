// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode } from 'types/design/types';

// utils
import { getPolygonCornerRadiusHandleAtPoint } from '../getPolygonCornerRadiusHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const polygon = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  sides: number,
  cornerRadius?: number,
  rotation = 0,
): TPolygonNode => ({
  cornerRadius,
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height,
  id,
  name: 'Polygon',
  parentId: null,
  rotation,
  sides,
  type: NodeType.polygon,
  width,
  x,
  y,
});

const ellipse: TEllipseNode = {
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
};

describe('getPolygonCornerRadiusHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    // mock
    const nodeA = polygon('a', 0, 0, 100, 100, 3, 15);
    const nodeB = polygon('b', 200, 0, 100, 100, 3, 15);

    // result
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 50, y: 15 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the single selected node does not support corner radius', () => {
    // result
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 50, y: 0 }, [ellipse], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the handle on an unrotated triangle', () => {
    // mock — top vertex of a 100x100 triangle sits at (50, 0); radius 15, scaled by the tip's 60deg
    const node = polygon('a', 0, 0, 100, 100, 3, 15);

    // result
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 50, y: 30 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      nodeId: 'a',
      rotation: 0,
      sides: 3,
    });
  });

  it('should be grabbable even while the corner radius is still 0, at the zero-state offset position', () => {
    // mock — the zero-state screen gap (30) for a 100x100 triangle
    const node = polygon('a', 0, 0, 100, 100, 3, 0);

    // result
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 50, y: 30 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ nodeId: 'a' });
  });

  it('should default a polygon with no cornerRadius field at all to the zero-state position', () => {
    // mock
    const node = polygon('a', 0, 0, 100, 100, 3, undefined);

    // result
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 50, y: 30 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ nodeId: 'a' });
  });

  it('should return null far away from the handle', () => {
    // mock
    const node = polygon('a', 0, 0, 100, 100, 3, 15);

    // result
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 90, y: 90 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should identify the handle by its physically rotated position', () => {
    // mock — the handle of an unrotated 100x100/radius-15 triangle sits at local (50, 30); rotating
    const node = polygon('a', 0, 0, 100, 100, 3, 15, 90);
    const center = { x: 50, y: 50 };

    // result
    expect(getPolygonCornerRadiusHandleAtPoint(rotatePoint({ x: 50, y: 30 }, center, 90), [node], IDENTITY_VIEWPORT)).toMatchObject({
      nodeId: 'a',
    });
  });

  it('should widen the hit tolerance in world units as the viewport zooms out', () => {
    // mock — a 400x400 triangle stays above the visibility threshold even zoomed out to 50%; radius
    const node = polygon('a', 0, 0, 400, 400, 3, 60);

    // result — RADIUS_HANDLE_HIT_RADIUS_PX is 5, so 8 world units off the handle misses at zoom 1
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 200, y: 128 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 200, y: 128 }, [node], { x: 0, y: 0, zoom: 0.5 })).toMatchObject({ nodeId: 'a' });
  });

  it('should return null once the shape renders too small on screen, regardless of cornerRadius', () => {
    // mock — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    const node = polygon('a', 0, 0, 100, 100, 3, 15);

    // result
    expect(getPolygonCornerRadiusHandleAtPoint({ x: 50, y: 15 }, [node], { x: 0, y: 0, zoom: 0.9 })).toBeNull();
  });
});
