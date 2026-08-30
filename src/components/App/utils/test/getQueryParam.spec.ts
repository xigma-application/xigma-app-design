// utils
import { getQueryParam } from '../getQueryParam';

describe('getQueryParam', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should read the named query param from the current URL', () => {
    // mock
    window.history.replaceState({}, '', '/?project=abc&page=xyz');

    // result
    expect(getQueryParam('project')).toBe('abc');
    expect(getQueryParam('page')).toBe('xyz');
  });

  it('should return null when the param is not present', () => {
    // mock
    window.history.replaceState({}, '', '/?project=abc');

    // result
    expect(getQueryParam('page')).toBeNull();
  });
});
