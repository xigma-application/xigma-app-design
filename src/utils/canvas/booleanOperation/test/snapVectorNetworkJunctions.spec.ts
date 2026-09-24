// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { snapVectorNetworkJunctions } from '../snapVectorNetworkJunctions';

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });
const segment = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

describe('snapVectorNetworkJunctions', () => {
  it('should merge vertices sharing a position', () => {
    // action
    const result = snapVectorNetworkJunctions(
      { s1: segment('s1', 'a', 'b'), s2: segment('s2', 'c', 'd') },
      { a: vertex('a', 0, 0), b: vertex('b', 10, 0), c: vertex('c', 10, 0), d: vertex('d', 10, 10) },
    );

    // result
    expect(Object.keys(result.vertices)).toEqual(['a', 'b', 'd']);
    expect(result.segments.s2).toMatchObject({ endId: 'd', startId: 'b' });
  });

  it('should split a straight segment at a vertex lying on it', () => {
    // action
    const result = snapVectorNetworkJunctions(
      { s1: segment('s1', 'a', 'b'), s2: segment('s2', 'c', 'd') },
      { a: vertex('a', 0, 0), b: vertex('b', 10, 0), c: vertex('c', 5, 0), d: vertex('d', 5, 10) },
    );

    // result
    expect(Object.values(result.segments).map(({ endId, startId }) => `${startId}>${endId}`)).toEqual(['a>c', 'c>b', 'c>d']);
  });

  it('should drop a duplicated straight segment', () => {
    // action
    const result = snapVectorNetworkJunctions(
      { s1: segment('s1', 'a', 'b'), s2: segment('s2', 'd', 'c') },
      { a: vertex('a', 0, 0), b: vertex('b', 10, 0), c: vertex('c', 0, 0), d: vertex('d', 10, 0) },
    );

    // result
    expect(Object.keys(result.segments)).toEqual(['s1']);
  });

  it('should keep curved segments untouched', () => {
    // mock
    const curved = { ...segment('s1', 'a', 'b'), tangentEnd: { x: 0, y: 5 }, tangentStart: { x: 0, y: 5 } };

    // action
    const result = snapVectorNetworkJunctions({ s1: curved }, { a: vertex('a', 0, 0), b: vertex('b', 10, 0), c: vertex('c', 5, 0) });

    // result
    expect(result.segments).toEqual({ s1: curved });
  });
});
