// others
import { PAGES_LIST_MIN_HEIGHT } from '../../constants';

// utils
import { getMaxPagesListHeight } from '../getMaxPagesListHeight';

describe('getMaxPagesListHeight', () => {
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    window.innerHeight = originalInnerHeight;
  });

  it('should return the viewport height minus the top offset and bottom margin', () => {
    // mock
    window.innerHeight = 900;

    // result
    expect(getMaxPagesListHeight()).toBe(900 - 58 - 150);
  });

  it('should never return less than the minimum height', () => {
    // mock
    window.innerHeight = 100;

    // result
    expect(getMaxPagesListHeight()).toBe(PAGES_LIST_MIN_HEIGHT);
  });
});
