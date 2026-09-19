import { renderHook } from '@testing-library/react';

// hooks
import { useEffectSettingsPanel } from './useEffectSettingsPanel';

// types
import { EffectType } from 'types/design/enums';

// utils
import { createEffect } from 'utils/design/effects/createEffect';

describe('useEffectSettingsPanel', () => {
  it('should commit color, opacity and picker changes on top of the current effect', () => {
    // Step 1: Prepare
    const effect = createEffect(EffectType.innerShadow);
    const onChange = vi.fn();
    const { result } = renderHook(() => useEffectSettingsPanel(effect, onChange));

    // Step 2: Commit each kind of change
    result.current.onCommitHex('#ff0000');
    result.current.onCommitAlpha(60);
    result.current.onPickerChange({ alpha: 10, hex: '#00ff00' });

    // Step 3: Assert
    expect(onChange).toHaveBeenNthCalledWith(1, { ...effect, color: '#ff0000' });
    expect(onChange).toHaveBeenNthCalledWith(2, { ...effect, opacity: 60 });
    expect(onChange).toHaveBeenNthCalledWith(3, { ...effect, color: '#00ff00', opacity: 10 });
  });
});
