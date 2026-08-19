// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../deriveVectorFaces';

const seg = (
  id: string,
  startId: string,
  endId: string,
  tangentStart: TVectorTangent = null,
  tangentEnd: TVectorTangent = null,
): TVectorSegment => ({ endId, id, startId, tangentEnd, tangentStart });

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[]): TVectorNode => ({
  fillColor: '#000',
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

const toXY = (points: TPoint[]): TPoint[] => points.map(({ x, y }) => ({ x, y }));

describe('deriveVectorFaces', () => {
  it('should derive exactly one face from a single closed triangle, not a duplicate CW+CCW pair', () => {
    // mock
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(1);
    expect(toXY(faces[0])).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
  });

  it('should derive no faces from a single open segment', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toEqual([]);
  });

  it('should derive only the loop’s face and ignore an open tail hanging off one of its vertices', () => {
    // mock — a closed triangle a-b-c, plus a tail segment from a out to a lone vertex d (degree-3 junction at a)
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10), vertex('d', -10, 0)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a'), seg('ad', 'a', 'd')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(1);
    expect(toXY(faces[0])).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
  });

  it('should derive two faces from two entirely disjoint closed loops', () => {
    // mock
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10), vertex('d', 100, 0), vertex('e', 110, 0), vertex('f', 105, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a'), seg('de', 'd', 'e'), seg('ef', 'e', 'f'), seg('fd', 'f', 'd')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(2);
    expect(toXY(faces[0])).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
    expect(toXY(faces[1])).toEqual([
      { x: 100, y: 0 },
      { x: 110, y: 0 },
      { x: 105, y: 10 },
    ]);
  });

  it('should still produce one face with curved (flattened) boundary points when a closing segment has bezier tangents', () => {
    // mock — two vertices, one curved segment p->q and one straight segment q->p closing the loop
    const node = buildNode([vertex('p', 0, 0), vertex('q', 20, 0)], [seg('pq', 'p', 'q', { x: 10, y: 10 }, null), seg('qp', 'q', 'p')]);

    // before
    const faces = deriveVectorFaces(node);

    // result — the curved segment alone flattens into 25 points (24 subdivisions + its start point), and
    // the straight closing segment contributes only its own start point, so the boundary is far more than
    // the 2 raw endpoints a straight-only loop would produce
    expect(faces).toHaveLength(1);
    expect(faces[0].length).toBeGreaterThan(2);
    expect(faces[0]).toHaveLength(25);
    expect(faces[0][0]).toEqual({ x: 0, y: 0 });
  });

  it('should read tangents from the segment’s own end (not blindly startId->endId) when the winning walk traverses it backwards', () => {
    // mock — same a-b-c triangle, but "ac" is defined startId=a/endId=c even though the only walk that
    // can ever close this loop reaches it going c->a, i.e. against its own declared direction; forward
    // is therefore false for that step, so tangentAtFrom must read tangentEnd (not tangentStart)
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ac', 'a', 'c', { x: 0, y: 5 }, { x: 0, y: -5 })],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result — still exactly one face; the "ac" leg is now curved (tangents set), so it alone
    // contributes segmentCount points (24) instead of 1, on top of the 2 straight legs' 1 point each
    expect(faces).toHaveLength(1);
    expect(faces[0]).toHaveLength(26);
    // the curved leg's own first point is exactly its fromId vertex "c", regardless of which tangent won
    expect(faces[0][2]).toEqual({ x: 5, y: 10 });
  });

  it('should return the same cached result for the same node reference instead of recomputing', () => {
    // mock
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );

    // before
    const first = deriveVectorFaces(node);
    const second = deriveVectorFaces(node);

    // result
    expect(second).toBe(first);
  });
});
