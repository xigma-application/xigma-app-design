// types
import { TVectorFaceStep } from '../../walkVectorFace';
import { TVectorPieceBoundaries } from '../../getVectorPieceBoundaryKeys';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getPieceKeys } from '../getPieceKeys';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });
const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

describe('getPieceKeys', () => {
  it('should derive one piece key per step for a triangle of unsplit (whole) segments', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: vertex('a', 0, 0), b: vertex('b', 10, 0), c: vertex('c', 5, 10) };
    const segments: Record<string, TVectorSegment> = { ab: seg('ab', 'a', 'b'), bc: seg('bc', 'b', 'c'), ca: seg('ca', 'c', 'a') };
    const steps: TVectorFaceStep[] = [
      { fromId: 'a', segmentId: 'ab', toId: 'b' },
      { fromId: 'b', segmentId: 'bc', toId: 'c' },
      { fromId: 'c', segmentId: 'ca', toId: 'a' },
    ];

    // before
    const keys = getPieceKeys(steps, segments, vertices, new Map());

    // result
    expect(keys.sort()).toEqual(['ab[v:a|v:b]', 'bc[v:b|v:c]', 'ca[v:a|v:c]'].sort());
  });

  it('should populate the boundaryKeysByRealSegmentId cache and reuse it for a second step on the same real segment', () => {
    // mock — two planar pieces of the same real segment "ab" (split at a crossing), both steps here
    const vertices: Record<string, TVectorVertex> = { a: vertex('a', 0, 0), b: vertex('b', 20, 0), x: vertex('x', 10, 0) };
    const segments: Record<string, TVectorSegment> = { 'ab#0': seg('ab#0', 'a', 'x'), 'ab#1': seg('ab#1', 'x', 'b') };
    const steps: TVectorFaceStep[] = [
      { fromId: 'a', segmentId: 'ab#0', toId: 'x' },
      { fromId: 'x', segmentId: 'ab#1', toId: 'b' },
    ];
    const boundaryKeysByRealSegmentId = new Map<string, Record<string, TVectorPieceBoundaries>>();

    // before
    const keys = getPieceKeys(steps, segments, vertices, boundaryKeysByRealSegmentId);

    // result — both steps resolve against the SAME cached boundary-keys entry for real segment "ab"
    expect(boundaryKeysByRealSegmentId.has('ab')).toBe(true);
    expect(keys).toHaveLength(2);
    expect(keys.every((key) => key.startsWith('ab['))).toBe(true);
  });

  it('should deduplicate identical piece keys produced by two different steps', () => {
    // mock — a degenerate walk that revisits the very same planar piece twice
    const vertices: Record<string, TVectorVertex> = { a: vertex('a', 0, 0), b: vertex('b', 10, 0) };
    const segments: Record<string, TVectorSegment> = { ab: seg('ab', 'a', 'b') };
    const steps: TVectorFaceStep[] = [
      { fromId: 'a', segmentId: 'ab', toId: 'b' },
      { fromId: 'a', segmentId: 'ab', toId: 'b' },
    ];

    // before
    const keys = getPieceKeys(steps, segments, vertices, new Map());

    // result
    expect(keys).toEqual(['ab[v:a|v:b]']);
  });
});
