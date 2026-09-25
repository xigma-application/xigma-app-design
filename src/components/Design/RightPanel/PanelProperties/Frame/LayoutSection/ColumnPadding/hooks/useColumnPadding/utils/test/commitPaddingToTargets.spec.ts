// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TPaddingTarget } from '../../types';

// utils
import { commitPaddingToTargets } from '../commitPaddingToTargets';

const commitMock = vi.fn();

vi.mock('../commitPaddingChange', () => ({ commitPaddingChange: (...args: unknown[]): unknown => commitMock(...args) }));

describe('commitPaddingToTargets', () => {
  beforeEach(() => {
    commitMock.mockClear();
  });

  it('should pad several frames as one undo step', () => {
    // mock
    const dispatch = vi.fn();
    const targets = [{ id: 'a' }, { id: 'b' }] as TPaddingTarget[];

    // before
    commitPaddingToTargets(dispatch, targets, (target) => ({ paddingTop: target.id === 'a' ? 1 : 2 }) as never);

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    expect(commitMock).toHaveBeenCalledWith(dispatch, 'b', { paddingTop: 2 });
    expect(dispatch).toHaveBeenLastCalledWith(endHistoryGesture());
  });

  it('should pad a single frame directly', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitPaddingToTargets(dispatch, [{ id: 'a' }] as TPaddingTarget[], () => ({ paddingTop: 1 }) as never);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(commitMock).toHaveBeenCalledWith(dispatch, 'a', { paddingTop: 1 });
  });
});
