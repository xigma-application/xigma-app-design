// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TFrameNode } from 'types/design/types';

// utils
import { commitOnFrames } from '../commitOnFrames';

describe('commitOnFrames', () => {
  it('should commit every frame inside one undo step', () => {
    // mock
    const dispatch = vi.fn();
    const commit = vi.fn();
    const frames = [{ id: 'a' }, { id: 'b' }] as TFrameNode[];

    // before
    commitOnFrames(dispatch, frames, commit);

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    expect(commit.mock.calls.map(([frame]) => frame.id)).toEqual(['a', 'b']);
    expect(dispatch).toHaveBeenLastCalledWith(endHistoryGesture());
  });
});
