// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { getRotateHandleAtPoint } from '../getRotateHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const frame = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  parentId: string | null = null,
  rotation = 0,
): TFrameNode => ({
  fill: '#ff0000',
  height,
  id,
  name: 'Frame',
  parentId,
  rotation,
  type: NodeType.frame,
  width,
  x,
  y,
});

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 100,
  y1: 0,
  y2: 0,
};

describe('getRotateHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    expect(getRotateHandleAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the single selected node is a line', () => {
    expect(getRotateHandleAtPoint({ x: 0, y: 0 }, [line], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the ring just outside a corner handle, on a single selected node', () => {
    // mock — the "nw" corner sits at (0, 0); CORNER_HANDLE_SIZE is 6, ROTATE_HANDLE_OUTER_RADIUS_PX is 16
    const node = frame('a', 0, 0, 100, 100);

    // result — 10 world units above the corner sits inside the ring (between 6 and 16)
    expect(getRotateHandleAtPoint({ x: 0, y: -10 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      rotation: 0,
    });
  });

  it('should not detect the ring inside the corner handle radius', () => {
    // mock
    const node = frame('a', 0, 0, 100, 100);

    // result — 3 world units above the corner is still within the resize corner's own radius
    expect(getRotateHandleAtPoint({ x: 0, y: -3 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should not detect the ring for a point inside the bounds, even within ring distance of a corner', () => {
    // mock — (5, 5) sits inside the 100x100 box and is only ~7 world units from the "nw" corner
    const node = frame('a', 0, 0, 100, 100);

    // result
    expect(getRotateHandleAtPoint({ x: 5, y: 5 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should not detect the ring beyond its outer radius', () => {
    // mock
    const node = frame('a', 0, 0, 100, 100);

    // result — 20 world units above the corner is past the ring's outer edge
    expect(getRotateHandleAtPoint({ x: 0, y: -20 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the ring at its actual rotated position for a rotated node', () => {
    // mock — rotating the node 45deg around its center (50, 50) swings the raw "nw" corner off the
    const node = frame('a', 0, 0, 100, 100, null, 45);
    const rotatedCorner = rotatePoint({ x: 0, y: 0 }, { x: 50, y: 50 }, 45);

    // result
    expect(getRotateHandleAtPoint({ x: rotatedCorner.x, y: rotatedCorner.y - 10 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      rotation: 45,
    });
    expect(getRotateHandleAtPoint({ x: 0, y: -10 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should use the combined bounds and zero rotation for a group selection', () => {
    // mock
    const nodeA = frame('a', 0, 0, 100, 100, 'parent-1');
    const nodeB = frame('b', 200, 0, 100, 100, 'parent-1');

    // result
    expect(getRotateHandleAtPoint({ x: 0, y: -10 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 300, x: 0, y: 0 },
      rotation: 0,
    });
  });

  it('should return null when the selected nodes are multiple but do not share a parent', () => {
    // mock
    const nodeA = frame('a', 0, 0, 100, 100, null);
    const nodeB = frame('b', 200, 0, 100, 100, 'other-parent');

    // result
    expect(getRotateHandleAtPoint({ x: 0, y: -10 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should widen the ring in world units as the viewport zooms out', () => {
    // mock
    const node = frame('a', 0, 0, 100, 100);

    // result — 20 world units above the corner misses the ring at zoom 1 (max 16 world units) but
    expect(getRotateHandleAtPoint({ x: 0, y: -20 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getRotateHandleAtPoint({ x: 0, y: -20 }, [node], { x: 0, y: 0, zoom: 0.5 })).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      rotation: 0,
    });
  });
});
