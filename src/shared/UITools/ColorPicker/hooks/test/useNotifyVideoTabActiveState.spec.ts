import { renderHook } from '@testing-library/react';

// hooks
import { useNotifyVideoTabActiveState } from '../useNotifyVideoTabActiveState';

// types
import { ColorPickerTab } from '../../enums';

describe('useNotifyVideoTabActiveState', () => {
  it('should report true when the active tab is Video', () => {
    // mock
    const onVideoTabActiveChange = vi.fn();

    // before
    renderHook(() => useNotifyVideoTabActiveState(ColorPickerTab.video, onVideoTabActiveChange));

    // result
    expect(onVideoTabActiveChange).toHaveBeenCalledWith(true);
  });

  it('should report false when the active tab is not Video', () => {
    // mock
    const onVideoTabActiveChange = vi.fn();

    // before
    renderHook(() => useNotifyVideoTabActiveState(ColorPickerTab.solid, onVideoTabActiveChange));

    // result
    expect(onVideoTabActiveChange).toHaveBeenCalledWith(false);
  });

  it('should not throw when no callback is given', () => {
    // before / result
    expect(() => renderHook(() => useNotifyVideoTabActiveState(ColorPickerTab.video))).not.toThrow();
  });
});
