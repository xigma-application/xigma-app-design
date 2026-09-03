import { act, renderHook } from '@testing-library/react';

// hooks
import { useSelectTheme } from '../useSelectTheme';

// others
import { STORAGE_KEY } from 'hooks/useTheme/constants';

describe('useSelectTheme', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should report the currently active theme', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'dark');

    // before
    const { result } = renderHook(() => useSelectTheme());

    // result
    expect(result.current.selectedTheme).toBe('dark');
  });

  it('should switch the theme to whichever value selectTheme was called with', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'dark');

    // before
    const { result } = renderHook(() => useSelectTheme());

    // action
    act(() => {
      result.current.selectTheme('light')();
    });

    // result
    expect(result.current.selectedTheme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should switch to the system theme', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'dark');

    // before
    const { result } = renderHook(() => useSelectTheme());

    // action
    act(() => {
      result.current.selectTheme('system')();
    });

    // result
    expect(result.current.selectedTheme).toBe('system');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
  });
});
