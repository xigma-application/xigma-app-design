import { fireEvent, renderHook } from '@testing-library/react';

// hooks
import { useIsSpaceHeld } from '../useIsSpaceHeld';

describe('useIsSpaceHeld', () => {
  it('should be false initially', () => {
    // before
    const { result } = renderHook(() => useIsSpaceHeld());

    // result
    expect(result.current).toBe(false);
  });

  it('should become true while Space is held, and false again once it is released', () => {
    // before
    const { result } = renderHook(() => useIsSpaceHeld());

    // action
    fireEvent.keyDown(window, { key: ' ' });

    // result
    expect(result.current).toBe(true);

    // action
    fireEvent.keyUp(window, { key: ' ' });

    // result
    expect(result.current).toBe(false);
  });

  it('should ignore unrelated keys, on both keydown and keyup', () => {
    // before
    const { result } = renderHook(() => useIsSpaceHeld());

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
    const { result } = renderHook(() => useIsSpaceHeld());

    fireEvent.keyDown(window, { key: ' ' });
    expect(result.current).toBe(true);

    // action
    fireEvent.blur(window);

    // result
    expect(result.current).toBe(false);
  });

  it('should prevent the default page scroll while treated as a hold', () => {
    // mock
    renderHook(() => useIsSpaceHeld());
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ' ' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // action
    window.dispatchEvent(event);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should ignore space typed inside a text input, letting the character through', () => {
    // mock
    const { result } = renderHook(() => useIsSpaceHeld());
    const input = document.createElement('input');

    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ' ' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // action
    input.dispatchEvent(event);

    // result
    expect(result.current).toBe(false);
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should ignore space typed inside a contentEditable element', () => {
    // mock
    const { result } = renderHook(() => useIsSpaceHeld());
    const editable = document.createElement('div');

    editable.contentEditable = 'true';
    document.body.appendChild(editable);

    // action
    editable.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ' ' }));

    // result
    expect(result.current).toBe(false);

    document.body.removeChild(editable);
  });

  it('should remove its listeners on unmount', () => {
    // before
    const { result, unmount } = renderHook(() => useIsSpaceHeld());

    unmount();

    // action — dispatched after unmount, must not throw or affect the now-detached hook
    fireEvent.keyDown(window, { key: ' ' });

    // result
    expect(result.current).toBe(false);
  });
});
