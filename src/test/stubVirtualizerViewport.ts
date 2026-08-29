export const stubVirtualizerViewport = (height = 400): void => {
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(height);
};
