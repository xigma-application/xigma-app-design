// @tanstack/react-virtual measures its scroll element via element.offsetHeight, which jsdom always
// reports as 0 — so no rows ever render in tests. Call this in a beforeEach (with a matching
// afterEach `vi.restoreAllMocks()`) to give the virtualizer a non-zero viewport and let it render
// (and overscan) its items.
export const stubVirtualizerViewport = (height = 400): void => {
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(height);
};
