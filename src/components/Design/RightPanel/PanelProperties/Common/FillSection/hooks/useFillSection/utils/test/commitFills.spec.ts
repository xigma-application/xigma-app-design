// store
import { updateNode } from 'store/design/slice';

// utils
import { commitFills } from '../commitFills';

describe('commitFills', () => {
  it('should dispatch updateNode when a nodeId is present', () => {
    // mock
    const dispatch = vi.fn();
    const fills = [{ color: '#000000', opacity: 100, type: 'solid' as const }];

    // before
    commitFills(dispatch, 'node-1', fills);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { fills }, id: 'node-1' }));
  });

  it('should not dispatch when there is no nodeId', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitFills(dispatch, undefined, []);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
