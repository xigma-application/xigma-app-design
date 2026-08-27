import { fireEvent, renderHook } from '@testing-library/react';

// hooks
import { useCloseSamplerOnEscape } from '../useCloseSamplerOnEscape';

describe('useCloseSamplerOnEscape', () => {
  it('should call onClose when Escape is pressed', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderHook(() => useCloseSamplerOnEscape(onClose));

    // action
    fireEvent.keyDown(window, { key: 'Escape' });

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should ignore any other key', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderHook(() => useCloseSamplerOnEscape(onClose));

    // action
    fireEvent.keyDown(window, { key: 'Enter' });

    // result
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should stop listening once unmounted', () => {
    // mock
    const onClose = vi.fn();

    // before
    const { unmount } = renderHook(() => useCloseSamplerOnEscape(onClose));

    unmount();

    // action
    fireEvent.keyDown(window, { key: 'Escape' });

    // result
    expect(onClose).not.toHaveBeenCalled();
  });
});
