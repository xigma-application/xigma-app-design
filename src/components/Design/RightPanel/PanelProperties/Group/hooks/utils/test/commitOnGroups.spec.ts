// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TGroupNode } from 'types/design/types';

// utils
import { commitOnGroups } from '../commitOnGroups';

const groups = [{ id: 'a' }, { id: 'b' }] as TGroupNode[];

describe('commitOnGroups', () => {
  it('should run the commit for every group inside one history gesture', () => {
    // mock
    const dispatch = vi.fn();
    const commitGroup = vi.fn();

    // action
    commitOnGroups(dispatch as unknown as AppDispatch, groups, commitGroup);

    // result
    expect(commitGroup.mock.calls.map(([group]) => group.id)).toEqual(['a', 'b']);
    expect(dispatch.mock.calls[0][0].type).toBe(beginHistoryGesture.type);
    expect(dispatch.mock.calls[1][0].type).toBe(endHistoryGesture.type);
  });

  it('should do nothing without groups', () => {
    // mock
    const dispatch = vi.fn();
    const commitGroup = vi.fn();

    // action
    commitOnGroups(dispatch as unknown as AppDispatch, [], commitGroup);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(commitGroup).not.toHaveBeenCalled();
  });
});
