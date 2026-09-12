// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// utils
import { commitOpacityChange } from '../commitOpacityChange';

describe('commitOpacityChange', () => {
  it('should dispatch updateNode with the percentage converted to a 0-1 fraction', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // action
    commitOpacityChange(dispatch, 'n1', 50);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { opacity: 0.5 }, id: 'n1' }));
  });
});
