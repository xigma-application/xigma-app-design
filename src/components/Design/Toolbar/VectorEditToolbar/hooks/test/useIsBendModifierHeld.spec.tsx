import { fireEvent, renderHook } from '@testing-library/react';

// hooks
import { useIsBendModifierHeld } from '../useIsBendModifierHeld';

describe('useIsBendModifierHeld', () => {
  it('should be false initially', () => {
    // before
    const { result } = renderHook(() => useIsBendModifierHeld());

    // result
    expect(result.current).toBe(false);
  });

  it('should become true while Control is held, and false again once it is released', () => {
    // before
    const { result } = renderHook(() => useIsBendModifierHeld());

    // action
    fireEvent.keyDown(window, { key: 'Control' });

    // result
    expect(result.current).toBe(true);

    // action
    fireEvent.keyUp(window, { key: 'Control' });

    // result
    expect(result.current).toBe(false);
  });

  it('should also react to the Meta key, for macOS Cmd', () => {
    // before
    const { result } = renderHook(() => useIsBendModifierHeld());

    // action
    fireEvent.keyDown(window, { key: 'Meta' });

    // result
    expect(result.current).toBe(true);
  });

  it('should ignore unrelated keys, on both keydown and keyup', () => {
    // before
    const { result } = renderHook(() => useIsBendModifierHeld());

    // action
    fireEvent.keyDown(window, { key: 'Shift' });

    // result
    expect(result.current).toBe(false);

    // action
    fireEvent.keyUp(window, { key: 'Shift' });

    // result
    expect(result.current).toBe(false);
  });

  it('should reset to false when the window loses focus, even without a matching keyup', () => {
    // before
    const { result } = renderHook(() => useIsBendModifierHeld());

    fireEvent.keyDown(window, { key: 'Control' });
    expect(result.current).toBe(true);

    // action
    fireEvent.blur(window);

    // result
    expect(result.current).toBe(false);
  });

  it('should remove its listeners on unmount', () => {
    // before
    const { result, unmount } = renderHook(() => useIsBendModifierHeld());

    unmount();

    // action — dispatched after unmount, must not throw or affect the now-detached hook
    fireEvent.keyDown(window, { key: 'Control' });

    // result
    expect(result.current).toBe(false);
  });
});
