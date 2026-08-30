// types
import { TVectorSegment } from 'types/design/types';

// utils
import { buildSegmentsByVertex } from '../buildSegmentsByVertex';
import { walkVectorChain } from '../walkVectorChain';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

describe('walkVectorChain', () => {
  it('should walk forward, without marking any segment reversed, when every segment already points the way it is walked', () => {
    // mock — a->b->c
    const segments = [seg('s1', 'a', 'b'), seg('s2', 'b', 'c')];

    // before
    const entries = walkVectorChain(segments, buildSegmentsByVertex(segments), 'a');

    // result
    expect(entries).toEqual([
      { reversed: false, segmentId: 's1' },
      { reversed: false, segmentId: 's2' },
    ]);
  });

  it('should mark a segment reversed when its stored start does not match the vertex it is walked from', () => {
    // mock — b->a, walked starting from 'a'
    const segments = [seg('s1', 'b', 'a')];

    // before
    const entries = walkVectorChain(segments, buildSegmentsByVertex(segments), 'a');

    // result
    expect(entries).toEqual([{ reversed: true, segmentId: 's1' }]);
  });

  it('should pick the lexicographically-smaller candidate segment id when a vertex has more than one unvisited option', () => {
    // mock — 'a' touches both s1 and s2; s1 sorts first
    const segments = [seg('s2', 'a', 'c'), seg('s1', 'a', 'b')];

    // before
    const entries = walkVectorChain(segments, buildSegmentsByVertex(segments), 'a');

    // result — walks s1 first, dead-ends at 'b' (s2 is still unvisited but unreachable from there)
    expect(entries).toEqual([{ reversed: false, segmentId: 's1' }]);
  });

  it('should stop walking once the current vertex has no unvisited segment', () => {
    // mock — a single a->b segment; nothing left to walk once 'b' is reached
    const segments = [seg('s1', 'a', 'b')];

    // before
    const entries = walkVectorChain(segments, buildSegmentsByVertex(segments), 'a');

    // result
    expect(entries).toEqual([{ reversed: false, segmentId: 's1' }]);
  });
});
