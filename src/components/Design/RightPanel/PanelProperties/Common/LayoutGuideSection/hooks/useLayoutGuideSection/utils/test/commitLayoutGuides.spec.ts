// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutGuideType } from 'types/design/enums';

// utils
import { commitLayoutGuides } from '../commitLayoutGuides';
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';

describe('commitLayoutGuides', () => {
  it('should update the node layout guides', () => {
    // Step 1: Prepare
    const dispatch = vi.fn();
    const layoutGuides = [createLayoutGuide(LayoutGuideType.grid)];

    // Step 2: Commit
    commitLayoutGuides(dispatch, 'node-1', layoutGuides);

    // Step 3: Assert
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { layoutGuides }, id: 'node-1' }));
  });

  it('should do nothing without a node id', () => {
    // Step 1: Prepare
    const dispatch = vi.fn();

    // Step 2: Commit
    commitLayoutGuides(dispatch, undefined, []);

    // Step 3: Assert
    expect(dispatch).not.toHaveBeenCalled();
  });
});
