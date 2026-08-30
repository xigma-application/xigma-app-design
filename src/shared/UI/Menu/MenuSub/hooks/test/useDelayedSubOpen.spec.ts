import { PointerEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useDelayedSubOpen } from '../useDelayedSubOpen';

const createPointerEnterEvent = (focus: TFunc): PointerEvent<HTMLDivElement> =>
  ({ currentTarget: { focus } }) as unknown as PointerEvent<HTMLDivElement>;

describe('useDelayedSubOpen', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start closed', () => {
    // before
    const { result } = renderHook(() => useDelayedSubOpen(false));

    // result
    expect(result.current.open).toBe(false);
  });

  it('should open and focus the trigger after the hover delay elapses', () => {
    // mock
    vi.useFakeTimers();
    const focus = vi.fn();

    // before
    const { result } = renderHook(() => useDelayedSubOpen(false));

    // action
    act(() => result.current.onPointerEnter(createPointerEnterEvent(focus)));
    expect(result.current.open).toBe(false);
    act(() => vi.runAllTimers());

    // result
    expect(result.current.open).toBe(true);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('should cancel the pending open when the pointer leaves before the delay elapses', () => {
    // mock
    vi.useFakeTimers();

    // before
    const { result } = renderHook(() => useDelayedSubOpen(false));

    // action
    act(() => result.current.onPointerEnter(createPointerEnterEvent(vi.fn())));
    act(() => result.current.onPointerLeave());
    act(() => vi.runAllTimers());

    // result
    expect(result.current.open).toBe(false);
  });

  it('should not schedule an open when disabled', () => {
    // mock
    vi.useFakeTimers();

    // before
    const { result } = renderHook(() => useDelayedSubOpen(true));

    // action
    act(() => result.current.onPointerEnter(createPointerEnterEvent(vi.fn())));
    act(() => vi.runAllTimers());

    // result
    expect(result.current.open).toBe(false);
  });

  it('should let onOpenChange set the open state directly, e.g. for click/keyboard-driven opens', () => {
    // before
    const { result } = renderHook(() => useDelayedSubOpen(false));

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);

    // action
    act(() => result.current.onOpenChange(false));

    // result
    expect(result.current.open).toBe(false);
  });

  it('should clear a pending open timer on unmount without throwing', () => {
    // mock
    vi.useFakeTimers();

    // before
    const { result, unmount } = renderHook(() => useDelayedSubOpen(false));
    act(() => result.current.onPointerEnter(createPointerEnterEvent(vi.fn())));

    // action
    unmount();

    // result
    expect(() => act(() => vi.runAllTimers())).not.toThrow();
  });
});
