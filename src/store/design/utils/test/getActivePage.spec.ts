// types
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';

describe('getActivePage', () => {
  it('should return the page whose id is active', () => {
    // mock
    const state = { activePageId: 'b', pages: { a: { id: 'a' }, b: { id: 'b' } } } as unknown as TDesignState;

    // result
    expect(getActivePage(state)).toBe(state.pages.b);
  });
});
