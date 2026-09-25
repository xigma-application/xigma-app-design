// store
import { updateNode, updateNodes } from 'store/design/slice';

// types
import { EffectType } from 'types/design/enums';
import { TAppearanceNode } from '../../../../../AppearanceSection/types';
import { TEffect } from 'types/design/types';

// utils
import { commitNodesEffects } from '../commitNodesEffects';
import { createEffect } from 'utils/design/effects/createEffect';

const nodeWith = (id: string, effects?: TEffect[]): TAppearanceNode => ({ effects, id }) as TAppearanceNode;

describe('commitNodesEffects', () => {
  it('should write one updateNode for a single node and one updateNodes for several', () => {
    // mock
    const dispatch = vi.fn();
    const effect = createEffect(EffectType.dropShadow);
    const getEffects = vi.fn(() => [effect]);

    // before
    commitNodesEffects(dispatch, [nodeWith('a')], getEffects);
    commitNodesEffects(dispatch, [nodeWith('a', [effect]), nodeWith('b')], getEffects);

    // result
    expect(getEffects).toHaveBeenCalledWith([]);
    expect(getEffects).toHaveBeenCalledWith([effect]);
    expect(dispatch).toHaveBeenNthCalledWith(1, updateNode({ changes: { effects: [effect] }, id: 'a' }));
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      updateNodes([
        { changes: { effects: [effect] }, id: 'a' },
        { changes: { effects: [effect] }, id: 'b' },
      ]),
    );
  });

  it('should dispatch nothing for no nodes', () => {
    // mock
    const dispatch = vi.fn();

    // before
    commitNodesEffects(dispatch, [], () => []);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
