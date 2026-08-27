import { renderHook } from '@testing-library/react';

// hooks
import { useSetActiveTab } from '../useSetActiveTab';

// types
import { ColorPickerTab } from '../../enums';

describe('useSetActiveTab', () => {
  it('should call setActiveTab when the tab name is a known ColorPickerTab', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(setActiveTab));

    // action
    result.current(ColorPickerTab.gradient);

    // result
    expect(setActiveTab).toHaveBeenCalledWith(ColorPickerTab.gradient);
  });

  it('should not call setActiveTab when the tab name is unknown', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(setActiveTab));

    // action
    result.current('unknown');

    // result
    expect(setActiveTab).not.toHaveBeenCalled();
  });
});
