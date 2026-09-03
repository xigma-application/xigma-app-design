// utils
import { getCssVariable } from '../getCssVariable';

describe('getCssVariable', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--xg-test-color');
  });

  it('should return the trimmed live value of the given custom property on the document root', () => {
    // mock
    document.documentElement.style.setProperty('--xg-test-color', ' #123456 ');

    // result
    expect(getCssVariable('--xg-test-color')).toBe('#123456');
  });

  it('should return an empty string when the property is not set anywhere', () => {
    expect(getCssVariable('--xg-never-set')).toBe('');
  });

  it('should pick up a live update to the property without any caching', () => {
    // mock
    document.documentElement.style.setProperty('--xg-test-color', 'red');

    expect(getCssVariable('--xg-test-color')).toBe('red');

    // action
    document.documentElement.style.setProperty('--xg-test-color', 'blue');

    // result
    expect(getCssVariable('--xg-test-color')).toBe('blue');
  });
});
