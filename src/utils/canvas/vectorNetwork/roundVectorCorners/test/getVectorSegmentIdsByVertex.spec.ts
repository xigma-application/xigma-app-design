// utils
import { getVectorSegmentIdsByVertex } from '../getVectorSegmentIdsByVertex';

describe('getVectorSegmentIdsByVertex', () => {
  it('should list the segments touching every vertex, a loop onto itself once', () => {
    // mock
    const segments = {
      loop: { endId: 'a', id: 'loop', startId: 'a', tangentEnd: { x: 1, y: 0 }, tangentStart: { x: 0, y: 1 } },
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    };

    // result
    expect(getVectorSegmentIdsByVertex(segments)).toEqual(
      new Map([
        ['a', ['loop', 's1']],
        ['b', ['s1']],
      ]),
    );
  });
});
