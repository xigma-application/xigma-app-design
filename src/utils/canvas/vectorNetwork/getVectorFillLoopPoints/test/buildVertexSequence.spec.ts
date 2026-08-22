// utils
import { buildVertexSequence } from '../buildVertexSequence';

describe('buildVertexSequence', () => {
  it('should return the first piece’s start followed by every piece’s end, in piece-index order', () => {
    // mock — 3 ordered pieces of one segment: a->x, x->y, y->b
    const boundaryKeys = {
      's1#0': { end: 'x:s2:0', start: 'v:a' },
      's1#1': { end: 'x:s2:1', start: 'x:s2:0' },
      's1#2': { end: 'v:b', start: 'x:s2:1' },
    };

    // before
    const sequence = buildVertexSequence(['s1#0', 's1#1', 's1#2'], boundaryKeys);

    // result
    expect(sequence).toEqual(['v:a', 'x:s2:0', 'x:s2:1', 'v:b']);
  });

  it('should return exactly the two boundaries of a single unsplit piece', () => {
    // mock
    const boundaryKeys = { s1: { end: 'v:b', start: 'v:a' } };

    // before
    const sequence = buildVertexSequence(['s1'], boundaryKeys);

    // result
    expect(sequence).toEqual(['v:a', 'v:b']);
  });
});
