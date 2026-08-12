// types
import { KeyboardKeys } from 'types/enums';
import { TKeysMap } from '../../types';

// utils
import { getPressedKeys, triggerActions } from '../triggerActions';

const keyDownEvent = (init: KeyboardEventInit = {}): KeyboardEvent => new KeyboardEvent('keydown', init);

describe('getPressedKeys', () => {
  it('should count how many modifier keys are held', () => {
    // result
    expect(getPressedKeys(keyDownEvent({ altKey: true, ctrlKey: true }))).toBe(2);
    expect(getPressedKeys(keyDownEvent())).toBe(0);
  });
});

describe('triggerActions', () => {
  it('should trigger action when the required control key is held', () => {
    // mock
    const action = vi.fn();
    const keysMap: TKeysMap = [{ action, primaryKeys: ['control'], secondaryKey: KeyboardKeys.c }];

    // before
    triggerActions(keyDownEvent({ code: KeyboardKeys.c, ctrlKey: true }), keysMap);

    // result
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not trigger action when the required control key is missing', () => {
    // mock
    const action = vi.fn();
    const keysMap: TKeysMap = [{ action, primaryKeys: ['control'], secondaryKey: KeyboardKeys.c }];

    // before
    triggerActions(keyDownEvent({ code: KeyboardKeys.c }), keysMap);

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should trigger action when the required meta key is held', () => {
    // mock
    const action = vi.fn();
    const keysMap: TKeysMap = [{ action, primaryKeys: ['meta'], secondaryKey: KeyboardKeys.c }];

    // before
    triggerActions(keyDownEvent({ code: KeyboardKeys.c, metaKey: true }), keysMap);

    // result
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not trigger action when the required meta key is missing', () => {
    // mock
    const action = vi.fn();
    const keysMap: TKeysMap = [{ action, primaryKeys: ['meta'], secondaryKey: KeyboardKeys.c }];

    // before
    triggerActions(keyDownEvent({ code: KeyboardKeys.c }), keysMap);

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should trigger action when the required shift key is held', () => {
    // mock
    const action = vi.fn();
    const keysMap: TKeysMap = [{ action, primaryKeys: ['shift'], secondaryKey: KeyboardKeys.c }];

    // before
    triggerActions(keyDownEvent({ code: KeyboardKeys.c, shiftKey: true }), keysMap);

    // result
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not trigger action when the required shift key is missing', () => {
    // mock
    const action = vi.fn();
    const keysMap: TKeysMap = [{ action, primaryKeys: ['shift'], secondaryKey: KeyboardKeys.c }];

    // before
    triggerActions(keyDownEvent({ code: KeyboardKeys.c }), keysMap);

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should not trigger action when an extra modifier is held beyond what is required', () => {
    // mock
    const action = vi.fn();
    const keysMap: TKeysMap = [{ action, secondaryKey: KeyboardKeys.c }];

    // before
    triggerActions(keyDownEvent({ code: KeyboardKeys.c, shiftKey: true }), keysMap);

    // result
    expect(action).not.toHaveBeenCalled();
  });

  it('should lock browser events using the meta key when ctrl is not held', () => {
    // mock
    const action = vi.fn();
    const event = keyDownEvent({ code: KeyboardKeys.f, metaKey: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const keysMap: TKeysMap = [{ action, secondaryKey: KeyboardKeys.f }];

    // before
    triggerActions(event, keysMap, true);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
