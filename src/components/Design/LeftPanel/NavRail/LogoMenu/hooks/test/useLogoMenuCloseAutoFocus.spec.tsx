import { RefObject } from 'react';

// hooks
import { useLogoMenuCloseAutoFocus } from '../useLogoMenuCloseAutoFocus';

describe('useLogoMenuCloseAutoFocus', () => {
  it('should prevent the default auto-focus and reset the ref when the ref is set', () => {
    // mock
    const ref: RefObject<boolean> = { current: true };
    const event = new Event('closeAutoFocus');
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const handleCloseAutoFocus = useLogoMenuCloseAutoFocus(ref);

    // action
    handleCloseAutoFocus(event);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(ref.current).toBe(false);
  });

  it('should leave the default auto-focus behavior untouched when the ref is not set', () => {
    // mock
    const ref: RefObject<boolean> = { current: false };
    const event = new Event('closeAutoFocus');
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const handleCloseAutoFocus = useLogoMenuCloseAutoFocus(ref);

    // action
    handleCloseAutoFocus(event);

    // result
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
