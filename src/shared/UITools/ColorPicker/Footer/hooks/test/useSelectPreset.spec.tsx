import { renderHook } from '@testing-library/react';

// hooks
import { useSelectPreset } from '../useSelectPreset';

describe('useSelectPreset', () => {
  it('should call onSelectPreset with the swatch preset', () => {
    // mock
    const onSelectPreset = vi.fn();

    // before
    const { result } = renderHook(() => useSelectPreset(onSelectPreset));

    // action
    result.current({ alpha: 100, hex: '#ff0000' })();

    // result
    expect(onSelectPreset).toHaveBeenCalledWith({ alpha: 100, hex: '#ff0000' });
  });
});
