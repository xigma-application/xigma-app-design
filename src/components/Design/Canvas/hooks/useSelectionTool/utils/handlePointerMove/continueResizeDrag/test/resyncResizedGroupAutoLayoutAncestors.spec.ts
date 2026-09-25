// store
import { updateNode } from 'store/design/slice';

// utils
import { resyncResizedGroupAutoLayoutAncestors } from '../resyncResizedGroupAutoLayoutAncestors';

vi.mock('store/design/utils/nodeHierarchy/getGroupLikeParentIds', () => ({
  getGroupLikeParentIds: (): string[] => ['group-a', 'group-b'],
}));

describe('resyncResizedGroupAutoLayoutAncestors', () => {
  it('should nudge every group-like parent of the resized nodes so their layout resyncs', () => {
    // mock
    const dispatch = vi.fn();

    // before
    resyncResizedGroupAutoLayoutAncestors(dispatch, ['a']);

    // result
    expect(dispatch.mock.calls).toEqual([[updateNode({ changes: {}, id: 'group-a' })], [updateNode({ changes: {}, id: 'group-b' })]]);
  });
});
