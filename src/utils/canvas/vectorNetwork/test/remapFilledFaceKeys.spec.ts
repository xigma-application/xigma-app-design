// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../deriveVectorFaces';
import { remapFilledFaceKeys } from '../remapFilledFaceKeys';

const seg = (
  id: string,
  startId: string,
  endId: string,
  tangentStart: TVectorTangent = null,
  tangentEnd: TVectorTangent = null,
): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd,
  tangentStart,
});

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[], filledFaceKeys: string[] = []): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys,
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
});

describe('remapFilledFaceKeys', () => {
  it('should return the new node’s own filledFaceKeys unchanged when the old node had no fills at all', () => {
    // mock — a plain triangle with no fills, geometry changed to a crossing shape
    const oldNode = buildNode(
      [vertex('v1', 0, 0), vertex('v2', 100, 0), vertex('v3', 50, 100)],
      [seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v1')],
    );
    const newNode = { ...oldNode, filledFaceKeys: [] };

    // before
    const result = remapFilledFaceKeys(oldNode, newNode);

    // result
    expect(result).toBe(newNode.filledFaceKeys);
  });

  it('should return the new node’s own filledFaceKeys unchanged when every old key is still a valid new face key', () => {
    // mock — same closed triangle, unchanged topology
    const segments = [seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v1')];
    const vertices = [vertex('v1', 0, 0), vertex('v2', 100, 0), vertex('v3', 50, 100)];
    const oldNode = buildNode(vertices, segments, ['s1,s2,s3']);
    const newNode = buildNode(vertices, segments, ['s1,s2,s3']);

    // before
    const result = remapFilledFaceKeys(oldNode, newNode);

    // result
    expect(result).toBe(newNode.filledFaceKeys);
  });

  it('should remap a single filled face onto both new faces when a vertex drag turns it into a self-intersecting ("bowtie") shape', () => {
    // mock — a plain, non-crossing, filled rectangle...
    const segments = [seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v4'), seg('s4', 'v4', 'v1')];
    const oldNode = buildNode([vertex('v1', 0, 0), vertex('v2', 100, 0), vertex('v3', 100, 100), vertex('v4', 0, 100)], segments, [
      's1,s2,s3,s4',
    ]);
    // ...dragged so v3/v4 swap corners, making s2 and s4 cross without sharing a vertex (same shape as
    // deriveVectorFaces.spec.ts's own bowtie fixture) — the raw segment ids are untouched by the drag
    const newNode = buildNode([vertex('v1', 0, 0), vertex('v2', 100, 0), vertex('v3', 0, 100), vertex('v4', 100, 100)], segments, [
      's1,s2,s3,s4',
    ]);

    // before
    const result = remapFilledFaceKeys(oldNode, newNode);
    const newFaceKeys = deriveVectorFaces(newNode).map((face) => face.key);

    // result — the old key is gone from the new topology, but both new lobes (subsets of the old
    // rectangle's area) get filled in its place
    expect(newFaceKeys).not.toContain('s1,s2,s3,s4');
    expect(newFaceKeys).toHaveLength(2);
    expect(result.sort()).toEqual(newFaceKeys.sort());
  });

  it('should merge two filled faces into the one new face that replaces them when a dividing segment is removed', () => {
    // mock — a square split into two triangles by one shared diagonal segment "ac" (walked forward by
    // one triangle, backward by the other — same shared-edge shape as deriveVectorFaces.spec.ts's own
    // square+triangle fixture), both triangles filled
    const oldNode = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ac', 'a', 'c'), seg('cd', 'c', 'd'), seg('da', 'd', 'a')],
      ['ab,ac,bc', 'ac,cd,da'],
    );
    // ...the diagonal is removed, leaving one single square face
    const newNode = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('cd', 'c', 'd'), seg('da', 'd', 'a')],
      ['ab,ac,bc', 'ac,cd,da'],
    );

    // before
    const result = remapFilledFaceKeys(oldNode, newNode);

    // result
    expect(deriveVectorFaces(newNode)).toHaveLength(1);
    expect(result).toEqual(['ab,bc,cd,da']);
  });

  it('should keep an untouched face’s own key while remapping a different, disturbed face in the same node', () => {
    // mock — a filled rectangle sharing the node with a filled, entirely separate, untouched triangle
    const rectangleSegments = [seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v4'), seg('s4', 'v4', 'v1')];
    const triangleSegments = [seg('t1', 't1', 't2'), seg('t2', 't2', 't3'), seg('t3', 't3', 't1')];
    const triangleVertices = [vertex('t1', 200, 200), vertex('t2', 300, 200), vertex('t3', 250, 300)];
    const oldNode = buildNode(
      [vertex('v1', 0, 0), vertex('v2', 100, 0), vertex('v3', 100, 100), vertex('v4', 0, 100), ...triangleVertices],
      [...rectangleSegments, ...triangleSegments],
      ['s1,s2,s3,s4', 't1,t2,t3'],
    );
    const newNode = buildNode(
      [vertex('v1', 0, 0), vertex('v2', 100, 0), vertex('v3', 0, 100), vertex('v4', 100, 100), ...triangleVertices],
      [...rectangleSegments, ...triangleSegments],
      ['s1,s2,s3,s4', 't1,t2,t3'],
    );

    // before
    const result = remapFilledFaceKeys(oldNode, newNode);

    // result — the triangle's own key survives untouched, alongside the rectangle's two remapped lobes
    expect(result).toContain('t1,t2,t3');
    expect(result).toHaveLength(3);
  });
});
