// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TStarNode } from 'types/design/types';

// utils
import { getStarCornerRadiusHandleAtPoint } from '../getStarCornerRadiusHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const star = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  points: number,
  ratio: number,
  cornerRadius?: number,
  rotation = 0,
): TStarNode => ({
  cornerRadius,
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height,
  id,
  name: 'Star',
  parentId: null,
  points,
  ratio,
  rotation,
  type: NodeType.star,
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

describe('getStarCornerRadiusHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    // mock
    const nodeA = star('a', 0, 0, 100, 100, 5, 0.5, 10);
    const nodeB = star('b', 200, 0, 100, 100, 5, 0.5, 10);

    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 50, y: 10 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the single selected node does not support corner radius', () => {
    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 50, y: 0 }, [ellipse], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the handle on an unrotated star', () => {
    // mock — top vertex of a 100x100 5-point star sits at (50, 0); radius 15 moves the handle by
    const node = star('a', 0, 0, 100, 100, 5, 0.5, 15);

    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 50, y: 33.893272 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'a',
      points: 5,
      ratio: 0.5,
      rotation: 0,
    });
  });

  it('should detect the handle at its physically flipped position when flipY is set', () => {
    // mock — top vertex of a 100x100 5-point star sits at (50, 0), center at (50, 50); radius 15
    const node = star('a', 0, 0, 100, 100, 5, 0.5, 15);
    const flippedNode = { ...node, flipY: true };

    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 50, y: 66.106728 }, [flippedNode], IDENTITY_VIEWPORT)).toMatchObject({
      flipY: true,
      nodeId: 'a',
    });
    expect(getStarCornerRadiusHandleAtPoint({ x: 50, y: 66.106728 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should be grabbable even while the corner radius is still 0, at the zero-state offset position', () => {
    // mock — max radius (~13.01) clamps the zero-state offset for a 100x100/5-point/ratio-0.5 star
    const node = star('a', 0, 0, 100, 100, 5, 0.5, 0);

    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 50, y: 29.398867 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ nodeId: 'a' });
  });

  it('should default a star with no cornerRadius field at all to the zero-state position', () => {
    // mock
    const node = star('a', 0, 0, 100, 100, 5, 0.5, undefined);

    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 50, y: 29.398867 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ nodeId: 'a' });
  });

  it('should return null far away from the handle', () => {
    // mock
    const node = star('a', 0, 0, 100, 100, 5, 0.5, 10);

    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 90, y: 90 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should identify the handle by its physically rotated position', () => {
    // mock — the handle of an unrotated 100x100/radius-15 star sits at local (50, ~33.89); rotating
    const node = star('a', 0, 0, 100, 100, 5, 0.5, 15, 90);
    const center = { x: 50, y: 50 };

    // result
    expect(getStarCornerRadiusHandleAtPoint(rotatePoint({ x: 50, y: 33.893272 }, center, 90), [node], IDENTITY_VIEWPORT)).toMatchObject({
      nodeId: 'a',
    });
  });

  it('should widen the hit tolerance in world units as the viewport zooms out', () => {
    // mock — a 400x400 star stays above the visibility threshold even zoomed out to 50%; radius 40
    const node = star('a', 0, 0, 400, 400, 5, 0.5, 40);

    // result — RADIUS_HANDLE_HIT_RADIUS_PX is 5, so 8 world units off the handle misses at zoom 1
    expect(getStarCornerRadiusHandleAtPoint({ x: 200, y: 98.382058 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getStarCornerRadiusHandleAtPoint({ x: 200, y: 98.382058 }, [node], { x: 0, y: 0, zoom: 0.5 })).toMatchObject({
      nodeId: 'a',
    });
  });

  it('should return null once the shape renders too small on screen, regardless of cornerRadius', () => {
    // mock — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    const node = star('a', 0, 0, 100, 100, 5, 0.5, 10);

    // result
    expect(getStarCornerRadiusHandleAtPoint({ x: 50, y: 10 }, [node], { x: 0, y: 0, zoom: 0.9 })).toBeNull();
  });
});
