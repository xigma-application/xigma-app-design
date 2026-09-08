// store
import { updateNode } from 'store/design/slice';

// utils
import { commitPaddingChange } from '../commitPaddingChange';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

describe('commitPaddingChange', () => {
  it('should dispatch an updateNode action with the given id and patch', () => {
    // mock
    const dispatch = vi.fn();

    // action
    commitPaddingChange(dispatch, 'frame-1', { paddingLeft: 12 });

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { paddingLeft: 12 }, id: 'frame-1' });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
