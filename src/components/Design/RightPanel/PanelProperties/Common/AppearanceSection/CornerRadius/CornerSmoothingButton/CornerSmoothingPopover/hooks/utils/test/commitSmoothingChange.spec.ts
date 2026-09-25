// store
import { updateNode } from 'store/design/slice';

// utils
import { commitSmoothingChange } from '../commitSmoothingChange';

describe('commitSmoothingChange', () => {
  it('should store the percentage as a fraction', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitSmoothingChange(dispatch, 'n', 60);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { cornerSmoothing: 0.6 }, id: 'n' }));
  });
});
