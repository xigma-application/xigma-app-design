import { act, renderHook } from '@testing-library/react';
import { PointerEvent as ReactPointerEvent } from 'react';

// hooks
import { useGridTrackReorderDrag } from '../useGridTrackReorderDrag';

const pointerEvent = (): ReactPointerEvent => ({ preventDefault: vi.fn() }) as unknown as ReactPointerEvent;

const rowAt = (top: number): HTMLElement => ({ getBoundingClientRect: () => ({ height: 20, top }) }) as unknown as HTMLElement;

describe('useGridTrackReorderDrag', () => {
  it('should start with no drag state', () => {
    const { result } = renderHook(() => useGridTrackReorderDrag(3, () => true));

    expect(result.current.dragState).toBeNull();
  });

  it('should begin a drag anchored on the first source index and block the default', () => {
    const { result } = renderHook(() => useGridTrackReorderDrag(3, () => true));
    const event = pointerEvent();

    act(() => result.current.beginDrag([2], event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.dragState).toEqual({ dropIndex: 2, sourceIndices: [2] });
  });

  it('should track the drop index from the pointer position and commit on release', () => {
    const onReorder = vi.fn(() => true);
    const { result } = renderHook(() => useGridTrackReorderDrag(3, onReorder));

    act(() => {
      result.current.registerRow(0)(rowAt(0));
      result.current.registerRow(1)(rowAt(20));
      result.current.registerRow(2)(rowAt(40));
    });

    act(() => result.current.beginDrag([0], pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 45 })));

    expect(result.current.dragState?.dropIndex).toBe(2);

    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(onReorder).toHaveBeenCalledWith([0], 2);
    expect(result.current.dragState).toBeNull();
  });

  it('should forget a row element when it unmounts', () => {
    const { result } = renderHook(() => useGridTrackReorderDrag(2, () => true));

    act(() => {
      result.current.registerRow(0)(rowAt(0));
      result.current.registerRow(0)(null);
    });

    act(() => result.current.beginDrag([0], pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 999 })));

    expect(result.current.dragState?.dropIndex).toBe(0);
  });

  it('should detach its listeners when unmounted mid-drag', () => {
    const onReorder = vi.fn(() => true);
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { result, unmount } = renderHook(() => useGridTrackReorderDrag(2, onReorder));

    act(() => result.current.beginDrag([0], pointerEvent()));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));

    removeSpy.mockRestore();
  });
});
