import { renderHook } from '@testing-library/react';

// hooks
import { useCopyPageLink } from '../useCopyPageLink';

const writeText = vi.fn();

describe('useCopyPageLink', () => {
  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should copy an origin-qualified link with the page id as a query param', () => {
    // before
    const { result } = renderHook(() => useCopyPageLink('page-abc'));

    // action
    result.current();

    // result
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/?page=page-abc`);
  });

  it('should carry the current ?project= param forward into the copied link', () => {
    // mock
    window.history.replaceState({}, '', '/?project=file-123');

    // before
    const { result } = renderHook(() => useCopyPageLink('page-abc'));

    // action
    result.current();

    // result
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/?project=file-123&page=page-abc`);
  });
});
