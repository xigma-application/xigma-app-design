import { renderHook } from '@testing-library/react';

// hooks
import { useNotifyImageTabActiveState } from '../useNotifyImageTabActiveState';

// types
import { ColorPickerTab } from '../../enums';

describe('useNotifyImageTabActiveState', () => {
  it('should report true when the active tab is Image', () => {
    // mock
    const onImageTabActiveChange = vi.fn();

    // before
    renderHook(() => useNotifyImageTabActiveState(ColorPickerTab.image, onImageTabActiveChange));

    // result
    expect(onImageTabActiveChange).toHaveBeenCalledWith(true);
  });

  it('should report false when the active tab is not Image', () => {
    // mock
    const onImageTabActiveChange = vi.fn();

    // before
    renderHook(() => useNotifyImageTabActiveState(ColorPickerTab.solid, onImageTabActiveChange));

    // result
    expect(onImageTabActiveChange).toHaveBeenCalledWith(false);
  });

  it('should not throw when no callback is given', () => {
    // before / result
    expect(() => renderHook(() => useNotifyImageTabActiveState(ColorPickerTab.image))).not.toThrow();
  });
});
