// store
import { updateNode } from 'store/design/slice';

// types
import { BlendMode } from 'types/design/enums';

// utils
import { commitBlendModeChange } from '../commitBlendModeChange';

describe('commitBlendModeChange', () => {
  it('should dispatch the blend mode change for the node', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitBlendModeChange(dispatch, 'n', BlendMode.darken);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { blendMode: BlendMode.darken }, id: 'n' }));
  });
});
