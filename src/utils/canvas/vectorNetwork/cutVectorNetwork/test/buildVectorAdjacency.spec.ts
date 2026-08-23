// types
import { TVectorSegment } from 'types/design/types';

// utils
import { buildVectorAdjacency } from '../buildVectorAdjacency';

describe('buildVectorAdjacency', () => {
  it('should map each vertex id to every segment id touching it', () => {
    // mock — a-b-c chain
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    };

    // before
    const adjacency = buildVectorAdjacency(segments);

    // result
    expect(adjacency.get('a')).toEqual(['s1']);
    expect(adjacency.get('b')).toEqual(['s1', 's2']);
    expect(adjacency.get('c')).toEqual(['s2']);
  });

  it('should return an empty map for an empty segments object', () => {
    // before
    const adjacency = buildVectorAdjacency({});

    // result
    expect(adjacency.size).toBe(0);
  });
});
