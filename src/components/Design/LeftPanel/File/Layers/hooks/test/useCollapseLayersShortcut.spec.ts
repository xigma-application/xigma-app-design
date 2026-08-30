import { renderHook } from '@testing-library/react';

// hooks
import { useCollapseLayersShortcut } from '../useCollapseLayersShortcut';

const pressKey = (init: KeyboardEventInit): void => {
  window.dispatchEvent(new KeyboardEvent('keydown', init));
};

describe('useCollapseLayersShortcut', () => {
  it('should call onCollapseAll on Alt+L while active', () => {
    // mock
    const onCollapseAll = vi.fn();

    // before
    renderHook(() => useCollapseLayersShortcut(true, onCollapseAll));

    // action
    pressKey({ altKey: true, code: 'KeyL' });

    // result
    expect(onCollapseAll).toHaveBeenCalledTimes(1);
  });

  it('should ignore Alt+L when not active', () => {
    // mock
    const onCollapseAll = vi.fn();

    // before
    renderHook(() => useCollapseLayersShortcut(false, onCollapseAll));

    // action
    pressKey({ altKey: true, code: 'KeyL' });

    // result
    expect(onCollapseAll).not.toHaveBeenCalled();
  });

  it('should ignore L without the Alt modifier, and Alt with another key', () => {
    // mock
    const onCollapseAll = vi.fn();

    // before
    renderHook(() => useCollapseLayersShortcut(true, onCollapseAll));

    // action
    pressKey({ altKey: false, code: 'KeyL' });
    pressKey({ altKey: true, code: 'KeyK' });

    // result
    expect(onCollapseAll).not.toHaveBeenCalled();
  });

  it('should detach the listener on unmount', () => {
    // mock
    const onCollapseAll = vi.fn();

    // before
    const { unmount } = renderHook(() => useCollapseLayersShortcut(true, onCollapseAll));
    unmount();

    // action
    pressKey({ altKey: true, code: 'KeyL' });

    // result
    expect(onCollapseAll).not.toHaveBeenCalled();
  });
});
