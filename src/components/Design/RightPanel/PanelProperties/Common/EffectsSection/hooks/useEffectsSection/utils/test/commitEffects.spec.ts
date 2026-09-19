// store
import { updateNode } from 'store/design/slice';

// types
import { EffectType } from 'types/design/enums';

// utils
import { commitEffects } from '../commitEffects';
import { createEffect } from 'utils/design/effects/createEffect';

describe('commitEffects', () => {
  it('should update the node effects', () => {
    // Step 1: Prepare
    const dispatch = vi.fn();
    const effects = [createEffect(EffectType.innerShadow)];

    // Step 2: Commit
    commitEffects(dispatch, 'node-1', effects);

    // Step 3: Assert
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { effects }, id: 'node-1' }));
  });

  it('should do nothing without a node id', () => {
    // Step 1: Prepare
    const dispatch = vi.fn();

    // Step 2: Commit
    commitEffects(dispatch, undefined, []);

    // Step 3: Assert
    expect(dispatch).not.toHaveBeenCalled();
  });
});
