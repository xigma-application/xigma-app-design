import { renderHook } from '@testing-library/react';

// hooks
import { useTabClick } from '../useTabClick';

describe('useTabClick', () => {
  it('should call setActiveTab with the tab name when the tab is not disabled', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    const { result } = renderHook(() => useTabClick(setActiveTab));

    // action
    result.current({ labelTranslationKey: 'tabs.solid', name: 'solid' })();

    // result
    expect(setActiveTab).toHaveBeenCalledWith('solid');
  });

  it('should not call setActiveTab when the tab is disabled', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    const { result } = renderHook(() => useTabClick(setActiveTab));

    // action
    result.current({ disabled: true, labelTranslationKey: 'tabs.gradient', name: 'gradient' })();

    // result
    expect(setActiveTab).not.toHaveBeenCalled();
  });
});
