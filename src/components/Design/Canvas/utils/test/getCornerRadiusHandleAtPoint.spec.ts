// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { getCornerRadiusHandleAtPoint } from '../getCornerRadiusHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  cornerRadius?: number,
  rotation = 0,
): TRectangleNode => ({
  cornerRadius,
  fill: '#ff0000',
  height,
  id,
  name: 'Rectangle',
  parentId: null,
  rotation,
  type: NodeType.rectangle,
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

describe('getCornerRadiusHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getCornerRadiusHandleAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    // mock
    const nodeA = rectangle('a', 0, 0, 100, 100, 20);
    const nodeB = rectangle('b', 200, 0, 100, 100, 20);

    // result
    expect(getCornerRadiusHandleAtPoint({ x: 20, y: 20 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the single selected node does not support corner radius', () => {
    // result
    expect(getCornerRadiusHandleAtPoint({ x: 50, y: 0 }, [ellipse], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect each corner handle on an unrotated rectangle', () => {
    // mock
    const node = rectangle('a', 0, 0, 100, 100, 20);

    // result
    expect(getCornerRadiusHandleAtPoint({ x: 80, y: 20 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      corners: ['ne'],
      nodeId: 'a',
      rotation: 0,
    });
    expect(getCornerRadiusHandleAtPoint({ x: 20, y: 20 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ corners: ['nw'] });
    expect(getCornerRadiusHandleAtPoint({ x: 80, y: 80 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ corners: ['se'] });
    expect(getCornerRadiusHandleAtPoint({ x: 20, y: 80 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ corners: ['sw'] });
  });

  it('should be grabbable even while the corner radius is still 0, at the zero-state offset position', () => {
    // mock — ZERO_RADIUS_HANDLE_OFFSET_PX (30) at zoom 1
    const node = rectangle('a', 0, 0, 100, 100, 0);

    // result
    expect(getCornerRadiusHandleAtPoint({ x: 70, y: 30 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ corners: ['ne'] });
  });

  it('should default a rectangle with no cornerRadius field at all to the zero-state position', () => {
    // mock
    const node = rectangle('a', 0, 0, 100, 100, undefined);

    // result
    expect(getCornerRadiusHandleAtPoint({ x: 70, y: 30 }, [node], IDENTITY_VIEWPORT)).toMatchObject({ corners: ['ne'] });
  });

  it('should return null far away from every handle', () => {
    // mock
    const node = rectangle('a', 0, 0, 100, 100, 20);

    // result
    expect(getCornerRadiusHandleAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should identify the handle by its physically rotated position', () => {
    // mock — the sw handle of an unrotated 100x100/radius-20 rect sits at local (20, 80); rotating
    // the node 90deg around its center (50, 50) swings that same physical point to world (20, 20)
    const node = rectangle('a', 0, 0, 100, 100, 20, 90);
    const center = { x: 50, y: 50 };

    // result
    expect(getCornerRadiusHandleAtPoint(rotatePoint({ x: 20, y: 80 }, center, 90), [node], IDENTITY_VIEWPORT)).toMatchObject({
      corners: ['sw'],
    });
  });

  it('should widen the hit tolerance in world units as the viewport zooms out', () => {
    // mock — a 400x400 shape stays above the visibility threshold even zoomed out to 50% (200 screen px)
    const node = rectangle('a', 0, 0, 400, 400, 80);

    // result — RADIUS_HANDLE_HIT_RADIUS_PX is 5, so 8 world units off the ne handle misses at zoom 1
    expect(getCornerRadiusHandleAtPoint({ x: 312, y: 80 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getCornerRadiusHandleAtPoint({ x: 312, y: 80 }, [node], { x: 0, y: 0, zoom: 0.5 })).toMatchObject({ corners: ['ne'] });
  });

  it('should return every coinciding corner as a candidate when the shape is at max radius', () => {
    // mock — a 100x100 square at max radius (50) collapses all 4 handles to its exact center (50, 50)
    const node = rectangle('a', 0, 0, 100, 100, 50);

    // result
    const hit = getCornerRadiusHandleAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT);

    expect(hit?.corners).toHaveLength(4);
    expect(hit?.corners).toEqual(expect.arrayContaining(['ne', 'nw', 'se', 'sw']));
  });

  it('should return only the coinciding pair as candidates on a non-square shape at max radius', () => {
    // mock — a 400x100 rectangle's max radius (50) is half its height, so insets from top and bottom
    const node = rectangle('a', 0, 0, 400, 100, 50);

    // result
    const hit = getCornerRadiusHandleAtPoint({ x: 50, y: 50 }, [node], IDENTITY_VIEWPORT);

    expect(hit?.corners).toHaveLength(2);
    expect(hit?.corners).toEqual(expect.arrayContaining(['nw', 'sw']));
  });

  it('should return null once the shape renders too small on screen, regardless of cornerRadius', () => {
    // mock — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    const node = rectangle('a', 0, 0, 100, 100, 20);

    // result
    expect(getCornerRadiusHandleAtPoint({ x: 80, y: 20 }, [node], { x: 0, y: 0, zoom: 0.9 })).toBeNull();
  });
});
