import i18n from 'i18next';

// utils
import { initI18n } from '../initI18n';

describe('initI18n', () => {
  it('should initialise i18next in the given language with the app resources', async () => {
    // before
    const t = await initI18n('pl');

    // result
    expect(i18n.language).toBe('pl');
    expect(i18n.options.fallbackLng).toEqual(['en']);
    expect(typeof t).toBe('function');
  });

  it('should default to the initial language of the browser', async () => {
    // mock
    localStorage.setItem('language', 'en');

    // before
    await initI18n();

    // result
    expect(i18n.language).toBe('en');

    // cleanup
    localStorage.clear();
  });
});
