import { fireEvent, renderHook } from '@testing-library/react';

// hooks
import { useClosePatternSourcePickingOnEscape } from '../useClosePatternSourcePickingOnEscape';

describe('useClosePatternSourcePickingOnEscape', () => {
  it('should call onClose when Escape is pressed while active', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderHook(() => useClosePatternSourcePickingOnEscape(true, onClose));

    // action
    fireEvent.keyDown(window, { key: 'Escape' });

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when Escape is pressed while inactive', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderHook(() => useClosePatternSourcePickingOnEscape(false, onClose));

    // action
    fireEvent.keyDown(window, { key: 'Escape' });

    // result
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should not call onClose for a non-Escape key while active', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderHook(() => useClosePatternSourcePickingOnEscape(true, onClose));

    // action
    fireEvent.keyDown(window, { key: 'Enter' });

    // result
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should remove the listener when it becomes inactive', () => {
    // mock
    const onClose = vi.fn();

    // before
    const { rerender } = renderHook(({ isActive }: { isActive: boolean }) => useClosePatternSourcePickingOnEscape(isActive, onClose), {
      initialProps: { isActive: true },
    });

    // action
    rerender({ isActive: false });
    fireEvent.keyDown(window, { key: 'Escape' });

    // result
    expect(onClose).not.toHaveBeenCalled();
  });
});
