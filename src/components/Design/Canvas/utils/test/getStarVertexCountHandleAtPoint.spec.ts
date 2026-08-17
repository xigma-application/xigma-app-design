// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TStarNode } from 'types/design/types';

// utils
import { getStarVertexCountHandleAtPoint } from '../getStarVertexCountHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const star = (id: string, x: number, y: number, width: number, height: number, points: number, ratio: number, rotation = 0): TStarNode => ({
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

describe('getStarVertexCountHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getStarVertexCountHandleAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a multi-node selection', () => {
    // mock
    const nodeA = star('a', 0, 0, 100, 100, 5, 0.5);
    const nodeB = star('b', 200, 0, 100, 100, 5, 0.5);

    // result
    expect(getStarVertexCountHandleAtPoint({ x: 97.552826, y: 34.54915 }, [nodeA, nodeB], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the single selected node is not a star', () => {
    // result
    expect(getStarVertexCountHandleAtPoint({ x: 50, y: 0 }, [ellipse], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should detect the handle on vertex index 2 (the next spike outer tip) of an unrotated star', () => {
    // mock — vertex index 2 of a 100x100 5-point star sits at (97.552826, 34.549150)
    const node = star('a', 0, 0, 100, 100, 5, 0.5);

    // result
    expect(getStarVertexCountHandleAtPoint({ x: 97.552826, y: 34.54915 }, [node], IDENTITY_VIEWPORT)).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: 'a',
      rotation: 0,
    });
  });

  it('should detect the handle at its physically flipped position when flipY is set', () => {
    // mock — vertex index 2 sits at (97.552826, 34.549150), center at (50, 50); flipping y mirrors
    // that to (97.552826, 65.450850)
    const node = star('a', 0, 0, 100, 100, 5, 0.5);
    const flippedNode = { ...node, flipY: true };

    // result
    expect(getStarVertexCountHandleAtPoint({ x: 97.552826, y: 65.45085 }, [flippedNode], IDENTITY_VIEWPORT)).toMatchObject({
      flipY: true,
      nodeId: 'a',
    });
    expect(getStarVertexCountHandleAtPoint({ x: 97.552826, y: 65.45085 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null far away from the handle', () => {
    // mock
    const node = star('a', 0, 0, 100, 100, 5, 0.5);

    // result
    expect(getStarVertexCountHandleAtPoint({ x: 10, y: 10 }, [node], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should identify the handle by its physically rotated position', () => {
    // mock — the handle of an unrotated 100x100 5-point star sits at local (97.552826, 34.549150);
    // rotating the node 90deg swings the physical hit point to the corresponding rotated position
    const node = star('a', 0, 0, 100, 100, 5, 0.5, 90);
    const center = { x: 50, y: 50 };

    // result
    expect(
      getStarVertexCountHandleAtPoint(rotatePoint({ x: 97.552826, y: 34.54915 }, center, 90), [node], IDENTITY_VIEWPORT),
    ).toMatchObject({ nodeId: 'a' });
  });

  it('should widen the hit tolerance in world units as the viewport zooms out', () => {
    // mock — a 400x400 star stays above the visibility threshold even zoomed out to 50%;
    // vertex index 2 sits at (390.211303, 138.196601)
    const node = star('a', 0, 0, 400, 400, 5, 0.5);

    // result — RADIUS_HANDLE_HIT_RADIUS_PX is 5, so 8 world units off the handle misses at zoom 1
    expect(getStarVertexCountHandleAtPoint({ x: 398.211303, y: 138.196601 }, [node], IDENTITY_VIEWPORT)).toBeNull();
    expect(getStarVertexCountHandleAtPoint({ x: 398.211303, y: 138.196601 }, [node], { x: 0, y: 0, zoom: 0.5 })).toMatchObject({
      nodeId: 'a',
    });
  });

  it('should return null once the shape renders too small on screen', () => {
    // mock — a 100x100 shape at 90% zoom renders at 90 screen px, below the 100px threshold
    const node = star('a', 0, 0, 100, 100, 5, 0.5);

    // result
    expect(getStarVertexCountHandleAtPoint({ x: 97.552826, y: 34.54915 }, [node], { x: 0, y: 0, zoom: 0.9 })).toBeNull();
  });
});
