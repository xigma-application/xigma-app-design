// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode } from 'types/design/types';

// utils
import { getPolygonVertexCountHandleAtPoint } from '../getPolygonVertexCountHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const polygon = (id: string, x: number, y: number, width: number, height: number, sides: number, rotation = 0): TPolygonNode => ({
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

describe('getPolygonVertexCountHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getPolygonVertexCountHandleAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    // mock
    const nodeA = polygon('a', 0, 0, 100, 100, 3);
    const nodeB = polygon('b', 200, 0, 100, 100, 3);

    // result
    expect(getPolygonVertexCountHandleAtPoint({ x: 93.30127, y: 75 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the single selected node is not a polygon', () => {
    // result
    expect(getPolygonVertexCountHandleAtPoint({ x: 50, y: 0 }, [ellipse], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the handle on vertex index 1 of an unrotated triangle', () => {
    // mock — vertex index 1 of a 100x100 triangle sits at (93.301270, 75)
    const node = polygon('a', 0, 0, 100, 100, 3);

    // result
    expect(getPolygonVertexCountHandleAtPoint({ x: 93.30127, y: 75 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'a',
      rotation: 0,
    });
  });

  it('should detect the handle at its physically flipped position when flipY is set', () => {
    // mock — vertex index 1 of a 100x100 triangle sits at (93.301270, 75), center at (50, 50);
    // flipping y mirrors that to (93.301270, 25)
    const node = polygon('a', 0, 0, 100, 100, 3);
    const flippedNode = { ...node, flipY: true };

    // result
    expect(getPolygonVertexCountHandleAtPoint({ x: 93.30127, y: 25 }, [flippedNode], IDENTITY_VIEWPORT)).toMatchObject({
      flipY: true,
      nodeId: 'a',
    });
    expect(getPolygonVertexCountHandleAtPoint({ x: 93.30127, y: 25 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null far away from the handle', () => {
    // mock
    const node = polygon('a', 0, 0, 100, 100, 3);

    // result
    expect(getPolygonVertexCountHandleAtPoint({ x: 10, y: 10 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should identify the handle by its physically rotated position', () => {
    // mock — the handle of an unrotated 100x100 triangle sits at local (93.301270, 75); rotating the
    // node 90deg swings the physical hit point to the corresponding rotated position
    const node = polygon('a', 0, 0, 100, 100, 3, 90);
    const center = { x: 50, y: 50 };

    // result
    expect(getPolygonVertexCountHandleAtPoint(rotatePoint({ x: 93.30127, y: 75 }, center, 90), [node], IDENTITY_VIEWPORT)).toMatchObject({
      nodeId: 'a',
    });
  });

  it('should widen the hit tolerance in world units as the viewport zooms out', () => {
    // mock — a 400x400 triangle stays above the visibility threshold even zoomed out to 50%;
    // vertex index 1 sits at (373.205081, 300)
    const node = polygon('a', 0, 0, 400, 400, 3);

    // result — RADIUS_HANDLE_HIT_RADIUS_PX is 5, so 8 world units off the handle misses at zoom 1
    expect(getPolygonVertexCountHandleAtPoint({ x: 381.205081, y: 300 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getPolygonVertexCountHandleAtPoint({ x: 381.205081, y: 300 }, [node], { x: 0, y: 0, zoom: 0.5 })).toMatchObject({
      nodeId: 'a',
    });
  });

  it('should return null once the shape renders too small on screen', () => {
    // mock — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    const node = polygon('a', 0, 0, 100, 100, 3);

    // result
    expect(getPolygonVertexCountHandleAtPoint({ x: 93.30127, y: 75 }, [node], { x: 0, y: 0, zoom: 0.9 })).toBeNull();
  });
});
