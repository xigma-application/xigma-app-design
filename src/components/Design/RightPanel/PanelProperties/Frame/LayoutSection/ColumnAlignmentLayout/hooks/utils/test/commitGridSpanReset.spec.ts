// store
import { updateNode } from 'store/design/slice';

// utils
import { commitGridSpanReset } from '../commitGridSpanReset';

describe('commitGridSpanReset', () => {
  it('should clear the column and row span of each listed child', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitGridSpanReset(dispatch, ['a', 'b']);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridColumnSpan: undefined, gridRowSpan: undefined }, id: 'a' }));
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { gridColumnSpan: undefined, gridRowSpan: undefined }, id: 'b' }));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('should dispatch nothing for an empty list', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitGridSpanReset(dispatch, []);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
