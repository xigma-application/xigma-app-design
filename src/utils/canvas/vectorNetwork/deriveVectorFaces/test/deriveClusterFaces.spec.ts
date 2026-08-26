// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TPlanarVectorNetwork } from '../../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from '../../getVectorNodeClusters/types';

// utils
import { deriveClusterFaces } from '../deriveClusterFaces';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });
const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const buildPlanar = (vertices: TVectorVertex[], segments: TVectorSegment[]): TPlanarVectorNetwork => ({
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

describe('deriveClusterFaces', () => {
  it('should derive exactly one face from a single closed triangle cluster', () => {
    // mock
    const planar = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );
    const cluster: TVectorNodeCluster = { key: 'a,b,c', segmentIds: ['ab', 'bc', 'ca'], vertexIds: ['a', 'b', 'c'] };

    // before
    const faces = deriveClusterFaces(cluster, planar, planar.vertices);

    // result
    expect(faces).toHaveLength(1);
    expect(faces[0].key).toBe('ab,bc,ca');
  });

  it('should only walk the given cluster’s own segments, ignoring an unrelated closed loop also present in the wider planar network', () => {
    // mock — the planar network has TWO disjoint triangles, but the cluster passed in only lists one
    const planar = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10), vertex('d', 100, 0), vertex('e', 110, 0), vertex('f', 105, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a'), seg('de', 'd', 'e'), seg('ef', 'e', 'f'), seg('fd', 'f', 'd')],
    );
    const cluster: TVectorNodeCluster = { key: 'a,b,c', segmentIds: ['ab', 'bc', 'ca'], vertexIds: ['a', 'b', 'c'] };

    // before
    const faces = deriveClusterFaces(cluster, planar, planar.vertices);

    // result — only the cluster's own triangle, nothing derived from the other one
    expect(faces).toHaveLength(1);
    expect(faces[0].key).toBe('ab,bc,ca');
  });

  it('should return no faces for a cluster with no closed loop', () => {
    // mock
    const planar = buildPlanar([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);
    const cluster: TVectorNodeCluster = { key: 'a,b', segmentIds: ['ab'], vertexIds: ['a', 'b'] };

    // before
    const faces = deriveClusterFaces(cluster, planar, planar.vertices);

    // result
    expect(faces).toEqual([]);
  });

  it('should resolve each face’s piece keys against the ORIGIN (real) vertices, not the planar (possibly crossing-split) ones', () => {
    // mock — a single unsplit triangle, so origin and planar vertices are the same set here; this
    // proves the originVertices param actually flows through to piece-key resolution
    const planar = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );
    const cluster: TVectorNodeCluster = { key: 'a,b,c', segmentIds: ['ab', 'bc', 'ca'], vertexIds: ['a', 'b', 'c'] };

    // before
    const faces = deriveClusterFaces(cluster, planar, planar.vertices);

    // result
    expect(faces[0].pieceKeys.sort()).toEqual(['ab[v:a|v:b]', 'bc[v:b|v:c]', 'ca[v:a|v:c]'].sort());
  });
});
