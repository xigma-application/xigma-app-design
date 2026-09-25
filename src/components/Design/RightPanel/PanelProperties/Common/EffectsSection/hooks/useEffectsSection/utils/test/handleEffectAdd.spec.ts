// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { handleEffectAdd } from '../handleEffectAdd';

describe('handleEffectAdd', () => {
  it('should replace mixed effects with the new one on add, and append otherwise', () => {
    // mock
    const commit = vi.fn();
    const existing = [createEffect(EffectType.dropShadow)];

    // before
    handleEffectAdd(EffectType.layerBlur, true, 0, commit, vi.fn(), vi.fn());
    handleEffectAdd(EffectType.layerBlur, false, 1, commit, vi.fn(), vi.fn());

    // result
    expect(commit.mock.calls[0][0](existing).map(({ type }: TEffect) => type)).toEqual([EffectType.layerBlur]);
    expect(commit.mock.calls[1][0](existing).map(({ type }: TEffect) => type)).toEqual([EffectType.dropShadow, EffectType.layerBlur]);
  });

  it('should select the new row and open its panel', () => {
    // mock
    const setSelectedIndices = vi.fn();
    const onPickerOpenChange = vi.fn();

    // before
    handleEffectAdd(EffectType.noise, false, 3, vi.fn(), setSelectedIndices, onPickerOpenChange);

    // result
    expect(setSelectedIndices).toHaveBeenCalledWith([3]);
    expect(onPickerOpenChange).toHaveBeenCalledWith(3, true);
  });
});
