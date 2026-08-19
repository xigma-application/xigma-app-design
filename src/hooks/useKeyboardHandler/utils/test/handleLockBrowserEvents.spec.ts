// types
import { KeyboardKeys } from 'types/enums';

// utils
import { handleLockBrowserEvents } from '../handleLockBrowserEvents';

const createEvent = (): KeyboardEvent => new KeyboardEvent('keydown');

describe('handleLockBrowserEvents', () => {
  it.each([KeyboardKeys['+'], KeyboardKeys['-'], KeyboardKeys.d, KeyboardKeys.f, KeyboardKeys.r, KeyboardKeys.s])(
    'should prevent the browser default for ctrl+%s',
    (secondaryKey) => {
      // mock
      const event = createEvent();
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      // before
      handleLockBrowserEvents(true, event, secondaryKey);

      // result
      expect(preventDefaultSpy).toHaveBeenCalled();
    },
  );

  it('should not prevent the browser default when ctrl is not held', () => {
    // mock
    const event = createEvent();
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // before
    handleLockBrowserEvents(false, event, KeyboardKeys.f);

    // result
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should prevent the browser default for a bare Alt keydown, regardless of ctrl', () => {
    // mock
    const event = new KeyboardEvent('keydown', { key: 'Alt' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // before
    handleLockBrowserEvents(false, event, KeyboardKeys.alt);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not prevent the browser default for a key outside the reserved list', () => {
    // mock
    const event = createEvent();
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // before
    handleLockBrowserEvents(true, event, KeyboardKeys.c);

    // result
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
