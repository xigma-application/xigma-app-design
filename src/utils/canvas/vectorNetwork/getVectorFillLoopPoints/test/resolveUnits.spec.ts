// types
import { TVectorPieceBoundaries } from '../../getVectorPieceBoundaryKeys';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { resolveUnits } from '../resolveUnits';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });
const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

describe('resolveUnits', () => {
  it('should resolve one unit per comma-separated piece key in the loop key', () => {
    const segments = { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') };
    const vertices = { a: vertex('a', 0, 0), b: vertex('b', 10, 0), c: vertex('c', 10, 10) };
    const boundaryKeysByRealSegmentId = new Map<string, Record<string, TVectorPieceBoundaries>>();

    const units = resolveUnits('s1[v:a|v:b],s2[v:b|v:c]', segments, vertices, boundaryKeysByRealSegmentId);

    expect(units).toHaveLength(2);
    expect(units.every((unit) => unit !== null)).toBe(true);
  });

  it('should resolve a piece key referencing a missing segment to null', () => {
    const segments = { s1: seg('s1', 'a', 'b') };
    const vertices = { a: vertex('a', 0, 0), b: vertex('b', 10, 0) };
    const boundaryKeysByRealSegmentId = new Map<string, Record<string, TVectorPieceBoundaries>>();

    const units = resolveUnits('s404[v:x|v:y]', segments, vertices, boundaryKeysByRealSegmentId);

    expect(units).toEqual([null]);
  });
});
