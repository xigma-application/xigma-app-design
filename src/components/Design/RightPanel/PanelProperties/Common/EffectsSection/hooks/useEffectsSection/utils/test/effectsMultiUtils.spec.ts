// types
import { EffectBlurType, EffectType } from 'types/design/enums';
import { TAppearanceNode } from '../../../../../AppearanceSection/types';
import { TEffect } from 'types/design/types';

// store
import { updateNode, updateNodes } from 'store/design/slice';

// utils
import { closeOpenItemPanel } from '../../../../../utils/closeOpenItemPanel';
import { commitNodesEffects } from '../commitNodesEffects';
import { createEffect } from 'utils/design/effects/createEffect';
import { getEffectsWithScrub } from '../getEffectsWithScrub';
import { getEffectsWithVisibility } from '../getEffectsWithVisibility';
import { getMixedEffectKeys } from '../getMixedEffectKeys';
import { getReorderedItems } from '../../../../../utils/getReorderedItems';
import { handleEffectAdd } from '../handleEffectAdd';
import { handleEffectOpenChange } from '../handleEffectOpenChange';
import { handleItemRemove } from '../../../../../utils/handleItemRemove';
import { handleItemStartDrag } from '../../../../../utils/handleItemStartDrag';
import { hasMatchingItemTypes } from '../../../../../utils/hasMatchingItemTypes';

const nodeWith = (id: string, effects?: TEffect[]): TAppearanceNode => ({ effects, id }) as TAppearanceNode;

describe('effects multi-selection utils', () => {
  it('should match only when every node has the same effect types in the same order', () => {
    // mock
    const shadow = createEffect(EffectType.dropShadow);
    const blur = createEffect(EffectType.layerBlur);

    // result
    expect(
      hasMatchingItemTypes([
        [shadow, blur],
        [{ ...shadow, x: 9 }, blur],
      ]),
    ).toBe(true);
    expect(
      hasMatchingItemTypes([
        [shadow, blur],
        [blur, shadow],
      ]),
    ).toBe(false);
    expect(hasMatchingItemTypes([[shadow], []])).toBe(false);
    expect(hasMatchingItemTypes([[], []])).toBe(true);
  });

  it('should report only the keys whose effective values differ, treating defaults as set', () => {
    // mock
    const blur = createEffect(EffectType.layerBlur);

    // action
    const keys = getMixedEffectKeys([blur, { ...blur, blur: blur.blur + 2, blurType: EffectBlurType.uniform }]);

    // result
    expect([...keys]).toEqual(['blur']);
  });

  it('should reorder each node its own effects by the shown reorder', () => {
    // mock
    const shown = [createEffect(EffectType.dropShadow), createEffect(EffectType.layerBlur)];
    const own = [
      { ...shown[0], x: 7 },
      { ...shown[1], blur: 30 },
    ];

    // result
    expect(getReorderedItems(own, shown, [shown[1], shown[0]])).toEqual([own[1], own[0]]);
  });

  it('should write one updateNode for a single node and one updateNodes for several', () => {
    // mock
    const dispatch = vi.fn();
    const effect = createEffect(EffectType.dropShadow);

    // action
    commitNodesEffects(dispatch, [nodeWith('a')], () => [effect]);
    commitNodesEffects(dispatch, [nodeWith('a'), nodeWith('b')], () => [effect]);

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, updateNode({ changes: { effects: [effect] }, id: 'a' }));
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      updateNodes([
        { changes: { effects: [effect] }, id: 'a' },
        { changes: { effects: [effect] }, id: 'b' },
      ]),
    );
  });

  it('should scrub a node its own value by the delta from the shown effect', () => {
    // mock
    const base = { ...createEffect(EffectType.dropShadow), x: 2 };
    const own = [{ ...base, x: 10 }];

    // action
    const [scrubbed] = getEffectsWithScrub(own, 0, base, 'x', Number.NEGATIVE_INFINITY, 5);

    // result
    expect(scrubbed.x).toBe(13);
  });

  it('should hide a visible effect and show a hidden one', () => {
    // mock
    const effect = createEffect(EffectType.dropShadow);

    // result
    expect(getEffectsWithVisibility([effect], 0, false)[0].visible).toBe(false);
    expect(getEffectsWithVisibility([{ ...effect, visible: false }], 0, true)[0].visible).toBeUndefined();
  });

  it('should replace mixed effects with the new one on add, and append otherwise', () => {
    // mock
    const commit = vi.fn();
    const existing = [createEffect(EffectType.dropShadow)];

    // action
    handleEffectAdd(EffectType.layerBlur, true, 0, commit, vi.fn(), vi.fn());
    handleEffectAdd(EffectType.layerBlur, false, 1, commit, vi.fn(), vi.fn());

    // result
    expect(commit.mock.calls[0][0](existing).map(({ type }: TEffect) => type)).toEqual([EffectType.layerBlur]);
    expect(commit.mock.calls[1][0](existing).map(({ type }: TEffect) => type)).toEqual([EffectType.dropShadow, EffectType.layerBlur]);
  });

  it('should select a row when its panel opens and close an open panel before removing or dragging', () => {
    // mock
    const setSelectedIndices = vi.fn();
    const onPickerOpenChange = vi.fn();
    const closeOpenPanel = vi.fn();
    const commit = vi.fn();
    const beginDrag = vi.fn();

    // action
    handleEffectOpenChange(1, true, setSelectedIndices, onPickerOpenChange);
    handleItemRemove(0, closeOpenPanel, setSelectedIndices, commit);
    handleItemStartDrag(2, {} as never, closeOpenPanel, [], setSelectedIndices, beginDrag);
    closeOpenItemPanel(3, onPickerOpenChange);
    closeOpenItemPanel(null, onPickerOpenChange);

    // result
    expect(setSelectedIndices).toHaveBeenCalledWith([1]);
    expect(onPickerOpenChange).toHaveBeenCalledWith(1, true);
    expect(commit.mock.calls[0][0]([1, 2])).toEqual([2]);
    expect(closeOpenPanel).toHaveBeenCalledTimes(2);
    expect(beginDrag).toHaveBeenCalledWith([2], 2, {});
    expect(onPickerOpenChange).toHaveBeenLastCalledWith(3, false);
  });
});
