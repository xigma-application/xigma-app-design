// types
import { TDesignState } from '../../types';

// utils
import { handleSetViewport } from '../handleSetViewport';

describe('handleSetViewport', () => {
  it('should set the viewport of the active page', () => {
    // mock
    const state = { activePageId: 'p', pages: { p: { viewport: { x: 0, y: 0, zoom: 1 } } } } as unknown as TDesignState;

    // before
    handleSetViewport(state, { x: 10, y: 20, zoom: 2 });

    // result
    expect(state.pages.p.viewport).toEqual({ x: 10, y: 20, zoom: 2 });
  });
});
