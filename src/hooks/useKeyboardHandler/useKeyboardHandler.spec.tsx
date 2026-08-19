import { fireEvent, renderHook } from '@testing-library/react';

// hooks
import { useKeyboardHandler } from './useKeyboardHandler';

// types
import { KeyboardKeys } from 'types/enums';
import { TKeyMap } from './types';

const keyMap: TKeyMap = { action: vi.fn(), secondaryKey: KeyboardKeys.c };

describe('useKeyboardHandler behaviors', () => {
  it('should trigger action on the matching key', () => {
    // mock
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action }]));

    // action
    fireEvent.keyDown(window, { code: KeyboardKeys.c });

    // result
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should trigger action for anyKey regardless of the pressed key', () => {
    // mock
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action, anyKey: true }]));

    // action
    fireEvent.keyDown(window, { code: KeyboardKeys.f });

    // result
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not attach a listener when attachListener is false', () => {
    // mock
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(false, [], [{ ...keyMap, action }]));

    // action
    fireEvent.keyDown(window, { code: KeyboardKeys.c });

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should scope the listener to the element matching id', () => {
    // mock
    const action = vi.fn();
    const element = document.createElement('div');

    element.setAttribute('id', 'shortcut-scope');
    document.body.appendChild(element);

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action }], 'shortcut-scope'));

    // action
    fireEvent.keyDown(element, { code: KeyboardKeys.c });

    // result
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should require the exact primary key combination', () => {
    // mock
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action, primaryKeys: ['alt'] }]));

    // action
    fireEvent.keyDown(window, { code: KeyboardKeys.c });

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should trigger action when the required primary key is held', () => {
    // mock
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action, primaryKeys: ['alt'] }]));

    // action
    fireEvent.keyDown(window, { altKey: true, code: KeyboardKeys.c });

    // result
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not trigger action when conditions are not met', () => {
    // mock
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action, conditions: [false] }]));

    // action
    fireEvent.keyDown(window, { code: KeyboardKeys.c });

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should block the browser default when lockBrowserEvents is set', () => {
    // mock
    const event = new KeyboardEvent('keydown', { code: KeyboardKeys.f, ctrlKey: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, secondaryKey: KeyboardKeys.f }], undefined, true));

    // action
    window.dispatchEvent(event);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should block the browser default for a bare Alt press when lockBrowserEvents is set', () => {
    // mock
    const event = new KeyboardEvent('keydown', { key: 'Alt' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // before
    renderHook(() => useKeyboardHandler(true, [], [keyMap], undefined, true));

    // action
    window.dispatchEvent(event);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not block the browser default for a bare Alt press when lockBrowserEvents is not set', () => {
    // mock
    const event = new KeyboardEvent('keydown', { key: 'Alt' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // before
    renderHook(() => useKeyboardHandler(true, [], [keyMap]));

    // action
    window.dispatchEvent(event);

    // result
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should stop propagation when stopPropagation is set', () => {
    // mock
    const event = new KeyboardEvent('keydown', { code: KeyboardKeys.c });
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    // before
    renderHook(() => useKeyboardHandler(true, [], [keyMap], undefined, undefined, true));

    // action
    window.dispatchEvent(event);

    // result
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should do nothing when the dispatched event has no key property', () => {
    // mock — anyKey would fire regardless of which key matched, proving the 'key' guard is what blocks this
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action, anyKey: true }]));

    // action
    window.dispatchEvent(new Event('keydown'));

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should do nothing when no element matches the given id', () => {
    // mock
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action }], 'missing-scope'));

    // action
    fireEvent.keyDown(window, { code: KeyboardKeys.c });

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should ignore a lone modifier key press', () => {
    // mock
    const action = vi.fn();

    // before
    renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action, anyKey: true }]));

    // action
    fireEvent.keyDown(window, { code: KeyboardKeys.alt, key: 'Alt' });

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should stop listening after unmount', () => {
    // mock
    const action = vi.fn();

    // before
    const { unmount } = renderHook(() => useKeyboardHandler(true, [], [{ ...keyMap, action }]));

    // action
    unmount();
    fireEvent.keyDown(window, { code: KeyboardKeys.c });

    // result
    expect(action).not.toHaveBeenCalled();
  });
});
