// utils
import { moveIdsToEdge } from '../moveIdsToEdge';

describe('moveIdsToEdge', () => {
  it('should move the given ids to the end, preserving the relative order of everyone else', () => {
    // before
    const order = ['a', 'b', 'c', 'd'];

    moveIdsToEdge(order, new Set(['b']), 'end');

    // result
    expect(order).toEqual(['a', 'c', 'd', 'b']);
  });

  it('should move the given ids to the start, preserving the relative order of everyone else', () => {
    // before
    const order = ['a', 'b', 'c', 'd'];

    moveIdsToEdge(order, new Set(['c']), 'start');

    // result
    expect(order).toEqual(['c', 'a', 'b', 'd']);
  });

  it('should preserve the moved ids’ own relative order among themselves', () => {
    // before — the concrete example from the request: [1, 2, 3], move "1" to the end -> [2, 3, 1]
    const order = ['1', '2', '3'];

    moveIdsToEdge(order, new Set(['1']), 'end');

    // result
    expect(order).toEqual(['2', '3', '1']);
  });

  it('should move multiple ids together, keeping their relative order', () => {
    // before
    const order = ['a', 'b', 'c', 'd'];

    moveIdsToEdge(order, new Set(['a', 'c']), 'end');

    // result
    expect(order).toEqual(['b', 'd', 'a', 'c']);
  });

  it('should be a no-op when none of the given ids are present', () => {
    // before
    const order = ['a', 'b', 'c'];

    moveIdsToEdge(order, new Set(['z']), 'end');

    // result
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('should be a no-op when every id is already at the requested edge', () => {
    // before
    const order = ['a', 'b', 'c'];

    moveIdsToEdge(order, new Set(['a', 'b', 'c']), 'end');

    // result
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('should mutate the array in place, not return a new one — matters for Immer drafts', () => {
    // before
    const order = ['a', 'b'];
    const originalReference = order;

    moveIdsToEdge(order, new Set(['a']), 'end');

    // result — same array reference, updated contents
    expect(order).toBe(originalReference);
    expect(order).toEqual(['b', 'a']);
  });
});
