import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useClearFillSelectionOnOutsideClick } from './useClearFillSelectionOnOutsideClick';

const refTo = (element: HTMLElement | null): RefObject<HTMLElement | null> => ({ current: element });

describe('useClearFillSelectionOnOutsideClick', () => {
  it('should clear the selection when a mousedown lands outside the container', () => {
    const clearSelection = vi.fn();
    const container = document.createElement('div');

    document.body.appendChild(container);
    renderHook(() => useClearFillSelectionOnOutsideClick(refTo(container), true, clearSelection));

    act(() => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));

    expect(clearSelection).toHaveBeenCalled();

    document.body.removeChild(container);
  });

  it('should not clear the selection when the mousedown lands inside the container', () => {
    const clearSelection = vi.fn();
    const container = document.createElement('div');
    const child = document.createElement('button');

    container.appendChild(child);
    document.body.appendChild(container);
    renderHook(() => useClearFillSelectionOnOutsideClick(refTo(container), true, clearSelection));

    act(() => child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));

    expect(clearSelection).not.toHaveBeenCalled();

    document.body.removeChild(container);
  });

  it('should not listen at all when there is no selection to clear', () => {
    const clearSelection = vi.fn();

    renderHook(() => useClearFillSelectionOnOutsideClick(refTo(null), false, clearSelection));

    act(() => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));

    expect(clearSelection).not.toHaveBeenCalled();
  });

  it('should detach its listener when unmounted', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useClearFillSelectionOnOutsideClick(refTo(null), true, vi.fn()));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    removeSpy.mockRestore();
  });
});
