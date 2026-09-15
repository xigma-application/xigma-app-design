import { act, renderHook } from '@testing-library/react';
import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// hooks
import { useFillReorderDrag } from './useFillReorderDrag';

const paint = (color: string): { color: string; opacity: number; type: 'solid' } => ({ color, opacity: 100, type: 'solid' });

const fills = [paint('a'), paint('b'), paint('c')];

const pointerEvent = (): ReactPointerEvent => ({ preventDefault: vi.fn() }) as unknown as ReactPointerEvent;

const rowAt = (top: number): HTMLElement => ({ getBoundingClientRect: () => ({ height: 20, top }) }) as unknown as HTMLElement;

const containerRef = (top = 0): RefObject<HTMLElement | null> => ({
  current: { getBoundingClientRect: () => ({ top }) } as unknown as HTMLElement,
});

describe('useFillReorderDrag', () => {
  it('should start with no drag state', () => {
    const { result } = renderHook(() => useFillReorderDrag(fills, vi.fn(), vi.fn(), containerRef()));

    expect(result.current.dragState).toBeNull();
  });

  it('should begin a drag anchored on the grabbed index, unmoved, and block the default', () => {
    const { result } = renderHook(() => useFillReorderDrag(fills, vi.fn(), vi.fn(), containerRef()));
    const event = pointerEvent();

    act(() => result.current.beginDrag([2], 2, event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.dragState).toEqual({ dropIndex: 2, dropOffset: 0, grabbedIndex: 2, hasMoved: false, sourceIndices: [2] });
  });

  it('should track the drop index/offset from the pointer position, flag the move, and commit the reorder on release', () => {
    const commit = vi.fn();
    const setSelection = vi.fn();
    const { result } = renderHook(() => useFillReorderDrag(fills, commit, setSelection, containerRef()));

    act(() => {
      result.current.registerRow(0)(rowAt(0));
      result.current.registerRow(1)(rowAt(20));
      result.current.registerRow(2)(rowAt(40));
    });

    act(() => result.current.beginDrag([0], 0, pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 45 })));

    expect(result.current.dragState?.dropIndex).toBe(2);
    expect(result.current.dragState?.dropOffset).toBe(40);
    expect(result.current.dragState?.hasMoved).toBe(true);

    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(commit).toHaveBeenCalledWith([paint('b'), paint('a'), paint('c')]);
    expect(setSelection).toHaveBeenCalledWith([1]);
    expect(result.current.dragState).toBeNull();
  });

  it('should compute the drop offset relative to the container, not the viewport', () => {
    const { result } = renderHook(() => useFillReorderDrag(fills, vi.fn(), vi.fn(), containerRef(100)));

    act(() => result.current.registerRow(0)(rowAt(140)));

    act(() => result.current.beginDrag([0], 0, pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 145 })));

    expect(result.current.dragState?.dropOffset).toBe(40);
  });

  it('should still report the release when nothing moved, reselecting the grabbed row without committing', () => {
    const commit = vi.fn();
    const setSelection = vi.fn();
    const { result } = renderHook(() => useFillReorderDrag(fills, commit, setSelection, containerRef()));

    act(() => result.current.beginDrag([0, 1], 0, pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(setSelection).toHaveBeenCalledWith([0]);
    expect(commit).not.toHaveBeenCalled();
  });

  it('should not throw or double-commit on a stray extra pointerup once the drag has already ended', () => {
    const commit = vi.fn();
    const setSelection = vi.fn();
    const { result } = renderHook(() => useFillReorderDrag(fills, commit, setSelection, containerRef()));

    act(() => result.current.beginDrag([0], 0, pointerEvent()));

    // two pointerup events land before React can process the first state update in between
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
      window.dispatchEvent(new PointerEvent('pointerup'));
    });

    expect(setSelection).toHaveBeenCalledTimes(1);
    expect(result.current.dragState).toBeNull();
  });

  it('should forget a row element when it unmounts', () => {
    const { result } = renderHook(() => useFillReorderDrag(fills.slice(0, 2), vi.fn(), vi.fn(), containerRef()));

    act(() => {
      result.current.registerRow(0)(rowAt(0));
      result.current.registerRow(0)(null);
    });

    act(() => result.current.beginDrag([0], 0, pointerEvent()));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 999 })));

    expect(result.current.dragState?.dropIndex).toBe(0);
  });

  it('should detach its listeners when unmounted mid-drag', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { result, unmount } = renderHook(() => useFillReorderDrag(fills.slice(0, 2), vi.fn(), vi.fn(), containerRef()));

    act(() => result.current.beginDrag([0], 0, pointerEvent()));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));

    removeSpy.mockRestore();
  });
});
