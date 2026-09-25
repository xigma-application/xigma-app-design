import { MouseEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useContextMenu } from '../useContextMenu';

describe('useContextMenu', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start closed with an empty anchor', () => {
    // before
    const { result } = renderHook(() => useContextMenu());

    // result
    expect(result.current.isOpen).toBe(false);
    expect(result.current.anchorRef.current.getBoundingClientRect()).toMatchObject({ height: 0, width: 0, x: 0, y: 0 });
  });

  it('should anchor at the pointer, notify the caller and open on the next tick', () => {
    // mock
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const preventDefault = vi.fn();

    // before
    const { result } = renderHook(() => useContextMenu(onOpen));

    // action
    act(() => result.current.onContextMenu({ clientX: 30, clientY: 40, preventDefault } as unknown as MouseEvent));

    // result
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(result.current.anchorRef.current.getBoundingClientRect()).toMatchObject({ x: 30, y: 40 });
    expect(result.current.isOpen).toBe(false);

    // wait
    act(() => {
      vi.runAllTimers();
    });

    // result
    expect(result.current.isOpen).toBe(true);
  });

  it('should open without an onOpen callback and close through onOpenChange', () => {
    // mock
    vi.useFakeTimers();

    // before
    const { result } = renderHook(() => useContextMenu());

    // action
    act(() => result.current.onContextMenu({ clientX: 1, clientY: 2, preventDefault: vi.fn() } as unknown as MouseEvent));
    act(() => {
      vi.runAllTimers();
    });
    act(() => result.current.onOpenChange(false));

    // result
    expect(result.current.isOpen).toBe(false);
  });
});
