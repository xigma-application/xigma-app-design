// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { eraseVectorNetworkAlongCapsule } from '../eraseVectorNetworkAlongCapsule';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

const straightNode = (): TVectorNode =>
  buildNode(
    { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
    { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
  );

describe('eraseVectorNetworkAlongCapsule', () => {
  it('should return null when the brush touches nothing', () => {
    // result
    expect(eraseVectorNetworkAlongCapsule(straightNode(), { x: 50, y: 50 }, { x: 50, y: 55 }, 5)).toBeNull();
  });

  it('should cut a gap in the middle of a segment and prune the orphaned split vertices', () => {
    // action — a dab straddling the middle of the segment
    const result = eraseVectorNetworkAlongCapsule(straightNode(), { x: 50, y: 0 }, { x: 50, y: 0 }, 15)!;
    const xs = Object.values(result.vertices)
      .map((vertex) => vertex.x)
      .sort((a, b) => a - b);

    // result — two stub segments, exactly four vertices (the two inner split points pruned)
    expect(Object.keys(result.segments)).toHaveLength(2);
    expect(Object.keys(result.vertices)).toHaveLength(4);
    expect(xs[0]).toBe(0);
    expect(xs[3]).toBe(100);
  });

  it('should delete a segment and both its vertices when the brush sweeps the whole thing', () => {
    // action — capsule running the full length of the segment
    const result = eraseVectorNetworkAlongCapsule(straightNode(), { x: 0, y: 0 }, { x: 100, y: 0 }, 20)!;

    // result
    expect(result.segments).toEqual({});
    expect(result.vertices).toEqual({});
  });

  it('should erase across more than one segment in a single sweep', () => {
    // mock — two parallel segments the capsule crosses
    const node = buildNode(
      {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 0, y: 20 },
        d: { id: 'd', x: 100, y: 20 },
      },
    );

    // action — a vertical stroke through x≈50 touching both edges
    const result = eraseVectorNetworkAlongCapsule(node, { x: 50, y: -5 }, { x: 50, y: 25 }, 6)!;

    // result — each edge is now two stubs
    expect(Object.keys(result.segments)).toHaveLength(4);
  });
});
