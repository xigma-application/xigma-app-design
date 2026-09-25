// utils
import { getResolvedTheme } from '../getResolvedTheme';

const mockColorScheme = (isLight: boolean): void => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: isLight }) as unknown as typeof window.matchMedia;
};

describe('getResolvedTheme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
    localStorage.clear();
  });

  it('should return the theme set on the document', () => {
    // mock
    document.documentElement.dataset.theme = 'light';

    // action / result
    expect(getResolvedTheme()).toBe('light');
  });

  it('should fall back to the stored theme before the document has one', () => {
    // mock
    localStorage.setItem('theme', 'dark');

    // action / result
    expect(getResolvedTheme()).toBe('dark');
  });

  it('should follow the system color scheme for the system theme', () => {
    // mock
    document.documentElement.dataset.theme = 'system';
    mockColorScheme(true);

    // action / result
    expect(getResolvedTheme()).toBe('light');

    // mock
    mockColorScheme(false);

    // action / result
    expect(getResolvedTheme()).toBe('dark');
  });
});
