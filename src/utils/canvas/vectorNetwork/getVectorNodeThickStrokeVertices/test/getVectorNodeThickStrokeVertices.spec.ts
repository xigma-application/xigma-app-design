// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorNodeThickStrokeVertices } from '../getVectorNodeThickStrokeVertices';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[], overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
  ...overrides,
});

const xs = (vertices: number[]): number[] => vertices.filter((_, index) => index % 2 === 0);
const ys = (vertices: number[]): number[] => vertices.filter((_, index) => index % 2 === 1);

describe('getVectorNodeThickStrokeVertices', () => {
  it('should tessellate a single straight segment into a halfWidth-wide rectangle (2 triangles, 12 numbers)', () => {
    // mock — a 100-unit horizontal segment, halfWidth 5
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('ab', 'a', 'b')]);

    // before
    const vertices = getVectorNodeThickStrokeVertices(node, 5);

    // result
    expect(vertices).toHaveLength(12);
    expect(Math.min(...xs(vertices))).toBeCloseTo(0);
    expect(Math.max(...xs(vertices))).toBeCloseTo(100);
    expect(Math.min(...ys(vertices))).toBeCloseTo(-5);
    expect(Math.max(...ys(vertices))).toBeCloseTo(5);
  });

  it('should add join vertices at a shared vertex where two segments of the same cluster meet', () => {
    // mock — an "L" bend: two segments sharing vertex "b"
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100)], [seg('ab', 'a', 'b'), seg('bc', 'b', 'c')]);

    // before
    const vertices = getVectorNodeThickStrokeVertices(node, 5);

    // result — 2 segment quads (24 numbers) plus at least one join triangle at the bend
    expect(vertices.length).toBeGreaterThan(24);
  });

  it('should sum independent clusters’ vertex counts, with no cross-cluster interference', () => {
    // mock — two disjoint single segments, far apart
    const nodeA = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('ab', 'a', 'b')]);
    const nodeBoth = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 500, 500), vertex('d', 600, 500)],
      [seg('ab', 'a', 'b'), seg('cd', 'c', 'd')],
    );

    // before
    const verticesA = getVectorNodeThickStrokeVertices(nodeA, 5);
    const verticesBoth = getVectorNodeThickStrokeVertices(nodeBoth, 5);

    // result — a second, identically-shaped disjoint segment doubles the vertex count
    expect(verticesBoth).toHaveLength(verticesA.length * 2);
  });

  it('should return the same array reference for a repeat call with the same node reference and halfWidth', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('ab', 'a', 'b')]);

    // before
    const first = getVectorNodeThickStrokeVertices(node, 5);
    const second = getVectorNodeThickStrokeVertices(node, 5);

    // result
    expect(second).toBe(first);
  });

  it('should not share a cached result across two different halfWidth values for the same node', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('ab', 'a', 'b')]);

    // before
    const thin = getVectorNodeThickStrokeVertices(node, 2);
    const thick = getVectorNodeThickStrokeVertices(node, 10);

    // result
    expect(Math.max(...ys(thin))).toBeCloseTo(2);
    expect(Math.max(...ys(thick))).toBeCloseTo(10);
  });

  it('should reuse the same underlying cluster result across two different node objects that share the same id and unchanged cluster members', () => {
    // mock — simulates an edit elsewhere in the node: a fresh node object/reference, but this
    // particular cluster's own vertex/segment objects are untouched
    const vertexA = vertex('a', 0, 0);
    const vertexB = vertex('b', 100, 0);
    const segmentAB = seg('ab', 'a', 'b');
    const nodeGen1 = buildNode([vertexA, vertexB], [segmentAB], { id: 'shared' });
    const nodeGen2 = buildNode([vertexA, vertexB], [segmentAB], { id: 'shared' });

    // before
    const first = getVectorNodeThickStrokeVertices(nodeGen1, 5);
    const second = getVectorNodeThickStrokeVertices(nodeGen2, 5);

    // result — different node objects, but the persistent per-cluster cache still resolves to
    // numerically identical geometry without needing the outer node reference to match
    expect(nodeGen1).not.toBe(nodeGen2);
    expect(second).toEqual(first);
  });

  it('should fall back to raw (unplanarized) clustering when the node actually has a crossing, instead of reusing planar clusters merged across it', () => {
    // mock — a horizontal and a vertical segment genuinely crossing at (5,5), sharing no vertex; this
    // means planarizeVectorNetwork's early-return (same object references) no longer applies, so
    // getVectorNodeThickStrokeVertices must fall back to clustering the raw node graph directly rather
    // than reusing the (now-merged-across-the-crossing) planar clusters fill derivation would use
    const node = buildNode(
      [vertex('h1', 0, 5), vertex('h2', 10, 5), vertex('v1', 5, 0), vertex('v2', 5, 10)],
      [seg('h', 'h1', 'h2'), seg('v', 'v1', 'v2')],
    );

    // before — each segment still gets its own independent halfWidth-wide rectangle (2 quads), since
    // stroke joins only happen at a genuinely shared vertex, never at a mere visual crossing
    const vertices = getVectorNodeThickStrokeVertices(node, 5);

    // result
    expect(vertices).toHaveLength(24);
  });

  it('should return an empty array for a node with no segments', () => {
    // mock
    const node = buildNode([], []);

    // result
    expect(getVectorNodeThickStrokeVertices(node, 5)).toEqual([]);
  });
});
