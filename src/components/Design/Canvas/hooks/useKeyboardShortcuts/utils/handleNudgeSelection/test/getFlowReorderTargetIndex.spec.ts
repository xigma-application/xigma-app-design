// utils
import { getFlowReorderTargetIndex } from '../getFlowReorderTargetIndex';

describe('getFlowReorderTargetIndex', () => {
  it('should return the anchor’s post-removal index for a "before" placement', () => {
    expect(getFlowReorderTargetIndex(['a', 'b', 'c', 'd'], ['a'], 'c', 'before')).toBe(1);
  });

  it('should return one past the anchor’s post-removal index for an "after" placement', () => {
    expect(getFlowReorderTargetIndex(['a', 'b', 'c', 'd'], ['a'], 'c', 'after')).toBe(2);
  });

  it('should not shift the anchor’s index when the moved node sits after it', () => {
    expect(getFlowReorderTargetIndex(['a', 'b', 'c', 'd'], ['d'], 'a', 'after')).toBe(1);
  });

  it('should remove every id in a multi-node move before computing the anchor index', () => {
    expect(getFlowReorderTargetIndex(['a', 'b', 'c', 'd', 'e'], ['a', 'b'], 'e', 'before')).toBe(2);
  });

  it('should locate the anchor by id, unaffected by an unrelated ignoreAutoLayout sibling interleaved in the raw array', () => {
    // 'floating' is not part of the flow sequence at all, but still occupies a raw childIds slot
    expect(getFlowReorderTargetIndex(['a', 'floating', 'b', 'c'], ['a'], 'c', 'before')).toBe(2);
  });
});
