import { act, renderHook } from '@testing-library/react';

// hooks
import { useTheme } from './useTheme';

// others
import { STORAGE_KEY } from './constants';

const stubMatchMedia = (matches: boolean): void => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches } as MediaQueryList);
};

describe('useTheme behaviors', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should read a previously stored light theme', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'light');

    // before
    const { result } = renderHook(() => useTheme());

    // result
    expect(result.current.theme).toBe('light');
  });

  it('should read a previously stored dark theme', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'dark');

    // before
    const { result } = renderHook(() => useTheme());

    // result
    expect(result.current.theme).toBe('dark');
  });

  it('should default to the OS light preference when nothing is stored', () => {
    // mock
    stubMatchMedia(true);

    // before
    const { result } = renderHook(() => useTheme());

    // result
    expect(result.current.theme).toBe('light');
  });

  it('should default to dark when nothing is stored and the OS has no light preference', () => {
    // mock
    stubMatchMedia(false);

    // before
    const { result } = renderHook(() => useTheme());

    // result
    expect(result.current.theme).toBe('dark');
  });

  it('should sync the theme to the document and localStorage', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'light');

    // before
    renderHook(() => useTheme());

    // result
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('should toggle from dark to light', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'dark');

    // before
    const { result } = renderHook(() => useTheme());

    // action
    act(() => {
      result.current.toggleTheme();
    });

    // result
    expect(result.current.theme).toBe('light');
  });

  it('should toggle from light to dark', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'light');

    // before
    const { result } = renderHook(() => useTheme());

    // action
    act(() => {
      result.current.toggleTheme();
    });

    // result
    expect(result.current.theme).toBe('dark');
  });
});
