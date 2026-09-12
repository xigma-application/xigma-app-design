// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// utils
import { commitCornerRadiusChange } from '../commitCornerRadiusChange';

describe('commitCornerRadiusChange', () => {
  it('should dispatch updateNode with the given changes', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // action
    commitCornerRadiusChange(dispatch, 'n1', { cornerRadiusTopLeft: 4 });

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { cornerRadiusTopLeft: 4 }, id: 'n1' }));
  });
});
