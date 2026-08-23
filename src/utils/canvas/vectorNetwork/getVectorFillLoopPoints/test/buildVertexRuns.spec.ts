// utils
import { buildVertexRuns } from '../buildVertexRuns';

describe('buildVertexRuns', () => {
  it('should return one run — the first piece’s start followed by every piece’s end, in piece-index order', () => {
    // mock — 3 ordered, contiguous pieces of one segment: a->x, x->y, y->b
    const boundaryKeys = {
      's1#0': { end: 'x:s2:0', start: 'v:a' },
      's1#1': { end: 'x:s2:1', start: 'x:s2:0' },
      's1#2': { end: 'v:b', start: 'x:s2:1' },
    };

    // before
    const runs = buildVertexRuns(['s1#0', 's1#1', 's1#2'], boundaryKeys);

    // result
    expect(runs).toEqual([{ pieceIds: ['s1#0', 's1#1', 's1#2'], vertexSequence: ['v:a', 'x:s2:0', 'x:s2:1', 'v:b'] }]);
  });

  it('should return a single run with exactly the two boundaries of an unsplit piece', () => {
    // mock
    const boundaryKeys = { s1: { end: 'v:b', start: 'v:a' } };

    // before
    const runs = buildVertexRuns(['s1'], boundaryKeys);

    // result
    expect(runs).toEqual([{ pieceIds: ['s1'], vertexSequence: ['v:a', 'v:b'] }]);
  });

  it('should split into two independent runs when a middle piece was deleted, leaving a gap', () => {
    // mock — Shape Builder deleted "s1#1" (x->y), leaving s1#0 (a->x) and s1#2 (y->b) with no
    // physical piece connecting them anymore
    const boundaryKeys = {
      's1#0': { end: 'x:s2:0', start: 'v:a' },
      's1#2': { end: 'v:b', start: 'x:s2:1' },
    };

    // before
    const runs = buildVertexRuns(['s1#0', 's1#2'], boundaryKeys);

    // result
    expect(runs).toEqual([
      { pieceIds: ['s1#0'], vertexSequence: ['v:a', 'x:s2:0'] },
      { pieceIds: ['s1#2'], vertexSequence: ['x:s2:1', 'v:b'] },
    ]);
  });

  it('should return an empty array when there are no pieces at all', () => {
    // before
    const runs = buildVertexRuns([], {});

    // result
    expect(runs).toEqual([]);
  });
});
