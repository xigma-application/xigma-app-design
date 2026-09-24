import { renderHook } from '@testing-library/react';

// hooks
import { useEffectSettingsPanel } from './useEffectSettingsPanel';

// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';

const NO_MIXED_KEYS = new Set<keyof TEffect>();

describe('useEffectSettingsPanel', () => {
  it('should commit color, opacity and picker changes as patches', () => {
    // mock
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useEffectSettingsPanel(effect, NO_MIXED_KEYS, onChange, vi.fn()));

    // action
    result.current.onCommitHex('#ff0000');
    result.current.onCommitAlpha(60);
    result.current.onPickerChange({ alpha: 10, hex: '#00ff00' });

    // result
    expect(onChange).toHaveBeenNthCalledWith(1, { color: '#ff0000' });
    expect(onChange).toHaveBeenNthCalledWith(2, { opacity: 60 });
    expect(onChange).toHaveBeenNthCalledWith(3, { color: '#00ff00', opacity: 10 });
  });

  it('should forward a scrub of the named field with its minimum', () => {
    // mock
    const onFieldScrub = vi.fn();

    // before
    const { result } = renderHook(() => useEffectSettingsPanel(createEffect(EffectType.innerShadow), NO_MIXED_KEYS, vi.fn(), onFieldScrub));

    // action
    result.current.onScrub('y', Number.NEGATIVE_INFINITY)(12);

    // result
    expect(onFieldScrub).toHaveBeenCalledWith('y', Number.NEGATIVE_INFINITY, 12);
  });

  it('should commit a typed value for a mixed field even when it equals the first layer value', () => {
    // mock
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useEffectSettingsPanel(effect, new Set<keyof TEffect>(['y']), onChange, vi.fn()));

    // action
    result.current.onBlur('y', Number.NEGATIVE_INFINITY)({ target: { value: String(effect.y) } } as never);

    // result
    expect(onChange).toHaveBeenCalledWith({ y: effect.y });
  });
});
