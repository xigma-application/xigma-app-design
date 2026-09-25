// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// utils
import { commitOnNodes } from '../commitOnNodes';

describe('commitOnNodes', () => {
  it('should wrap a multi-node commit in one history gesture', () => {
    // mock
    const dispatch = vi.fn();
    const commit = vi.fn();

    // before
    commitOnNodes(dispatch, ['a', 'b'], commit);

    // result
    expect(dispatch.mock.calls).toEqual([[beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)], [endHistoryGesture()]]);
    expect(commit.mock.calls.map(([node]) => node)).toEqual(['a', 'b']);
  });

  it('should commit a single node without a gesture', () => {
    // mock
    const dispatch = vi.fn();
    const commit = vi.fn();

    // before
    commitOnNodes(dispatch, ['a'], commit);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(commit).toHaveBeenCalledTimes(1);
  });
});
