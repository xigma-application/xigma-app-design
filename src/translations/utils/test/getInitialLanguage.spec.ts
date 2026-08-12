// others
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from '../../constants';

// utils
import { getInitialLanguage } from '../getInitialLanguage';

describe('getInitialLanguage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return the language stored in localStorage when it is available', () => {
    // before
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pl');

    // result
    expect(getInitialLanguage()).toBe('pl');
  });

  it('should ignore a stored language that is not available', () => {
    // spy
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');

    // before
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');

    // result
    expect(getInitialLanguage()).toBe('en');
  });

  it('should fall back to the system language when nothing is stored', () => {
    // spy
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pl-PL');

    // result
    expect(getInitialLanguage()).toBe('pl');
  });

  it('should fall back to the default language when neither storage nor the system language is available', () => {
    // spy
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');

    // result
    expect(getInitialLanguage()).toBe(DEFAULT_LANGUAGE);
  });
});
