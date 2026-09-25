// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// utils
import { commitSelectionSpacing } from '../commitSelectionSpacing';

const applyMock = vi.fn();

vi.mock('../applySelectionSpacing', () => ({ applySelectionSpacing: (...args: unknown[]): unknown => applyMock(...args) }));

describe('commitSelectionSpacing', () => {
  it('should apply the spacing inside one history gesture', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitSelectionSpacing(dispatch, [['a'], ['b']], 'horizontal', 8);

    // result
    expect(dispatch.mock.calls).toEqual([[beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)], [endHistoryGesture()]]);
    expect(applyMock).toHaveBeenCalledWith(dispatch, [['a'], ['b']], 'horizontal', 8);
  });
});
