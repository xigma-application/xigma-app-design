// store
import { updateNode } from 'store/design/slice';

// types
import { BlendMode } from 'types/design/enums';
import { TAppearanceNode } from '../../../../../types';

// utils
import { commitBlendModeToNodes } from '../commitBlendModeToNodes';

describe('commitBlendModeToNodes', () => {
  it('should dispatch the blend mode for every node', () => {
    // mock
    const dispatch = vi.fn();
    const nodes = [{ id: 'a' }, { id: 'b' }] as TAppearanceNode[];

    // before
    commitBlendModeToNodes(dispatch, nodes, BlendMode.color);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { blendMode: BlendMode.color }, id: 'a' }));
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { blendMode: BlendMode.color }, id: 'b' }));
  });
});
