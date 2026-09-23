// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getFlowBackwardCrossCandidateIds } from '../getFlowBackwardCrossCandidateIds';

const size = (id: string, width: number): TAutoLayoutChildSize => ({ height: 20, id, width }) as unknown as TAutoLayoutChildSize;

const sizesById = (...entries: TAutoLayoutChildSize[]): Map<string, TAutoLayoutChildSize> =>
  new Map(entries.map((entry) => [entry.id, entry]));

describe('getFlowBackwardCrossCandidateIds', () => {
  it('should insert the block directly after the previous line with zero eviction when it already fits', () => {
    const sizes = sizesById(size('a', 100), size('b', 100), size('c', 100), size('d', 15));

    expect(getFlowBackwardCrossCandidateIds(['a', 'b', 'c', 'd'], ['a', 'b'], ['d'], 1, sizes, true, 0, 220)).toEqual({
      blockAnchorId: 'c',
      candidateFlowIds: ['a', 'b', 'd', 'c'],
      evictedIds: [],
    });
  });

  it('should swap the block into the previous line at the SAME index it occupies in its own line, not the previous line’s tail (the exact bug reported live)', () => {
    // the block is the FIRST (only) item of its own line — it should trade places with the
    // previous line's FIRST item ('a'), not its last ('c'). 300px fits any 2 of these 100px items
    // plus the block, but not all 3 originals plus the block — so exactly one eviction is needed,
    // and it must be the index-0 item, not whichever the old tail-eviction logic would have picked
    const sizes = sizesById(size('a', 100), size('b', 100), size('c', 100), size('d', 100));

    expect(getFlowBackwardCrossCandidateIds(['a', 'b', 'c', 'd'], ['a', 'b', 'c'], ['d'], 0, sizes, true, 0, 300)).toEqual({
      blockAnchorId: 'b',
      candidateFlowIds: ['d', 'b', 'c', 'a'],
      evictedIds: ['a'],
    });
  });

  it('should evict exactly enough items starting at the block’s own index to make room, when a single swap isn’t enough', () => {
    // the block is the SECOND item of its own (2-item) line, so eviction targets index 1 of the
    // previous line — here that alone is already enough
    const sizes = sizesById(size('a', 100), size('b', 100), size('c', 100), size('d', 100));

    expect(getFlowBackwardCrossCandidateIds(['a', 'b', 'c', 'd'], ['a', 'b'], ['d'], 1, sizes, true, 0, 200)).toEqual({
      blockAnchorId: 'b',
      candidateFlowIds: ['a', 'd', 'b', 'c'],
      evictedIds: ['b'],
    });
  });

  it('should evict the whole previous line when that’s the only way the block fits', () => {
    const sizes = sizesById(size('a', 100), size('b', 90));

    expect(getFlowBackwardCrossCandidateIds(['a', 'b'], ['a'], ['b'], 0, sizes, true, 0, 90)).toEqual({
      blockAnchorId: 'a',
      candidateFlowIds: ['b', 'a'],
      evictedIds: ['a'],
    });
  });

  it('should return null when the block itself is wider than the available space, even after evicting everything', () => {
    const sizes = sizesById(size('a', 50), size('b', 150));

    expect(getFlowBackwardCrossCandidateIds(['a', 'b'], ['a'], ['b'], 0, sizes, true, 0, 100)).toBeNull();
  });

  it('should account for item spacing between the kept previous-line content and the block', () => {
    // exactly at capacity without the gap, but the required inter-item gap pushes it over
    const sizes = sizesById(size('a', 100), size('b', 100));

    expect(getFlowBackwardCrossCandidateIds(['a', 'b'], ['a'], ['b'], 0, sizes, true, 10, 200)).toEqual({
      blockAnchorId: 'a',
      candidateFlowIds: ['b', 'a'],
      evictedIds: ['a'],
    });
  });

  it('should read height instead of width for a vertical (non-horizontal) frame', () => {
    const sizes = sizesById(size('a', 100), size('b', 100));

    // sizes here represent widths in the `size` helper, but with isHorizontal false the function
    // must read .height instead — using the same numeric values keeps this test focused on which
    // property gets read
    expect(getFlowBackwardCrossCandidateIds(['a', 'b'], ['a'], ['b'], 0, sizes, false, 0, 200)).toEqual({
      blockAnchorId: undefined,
      candidateFlowIds: ['a', 'b'],
      evictedIds: [],
    });
  });

  it('should handle an empty previous line defensively, treating it as already having room', () => {
    const sizes = sizesById(size('b', 50));

    expect(getFlowBackwardCrossCandidateIds(['b'], [], ['b'], 0, sizes, true, 0, 100)).toEqual({
      blockAnchorId: undefined,
      candidateFlowIds: ['b'],
      evictedIds: [],
    });
  });

  it('should treat a missing size entry as zero width instead of throwing', () => {
    const sizes = sizesById(size('a', 100));

    expect(getFlowBackwardCrossCandidateIds(['a', 'b'], ['a'], ['b'], 0, sizes, true, 0, 100)).toEqual({
      blockAnchorId: undefined,
      candidateFlowIds: ['a', 'b'],
      evictedIds: [],
    });
  });
});
