import { renderHook } from '@testing-library/react';

// hooks
import { useIgnoreMiddleClickInteractOutside } from '../useIgnoreMiddleClickInteractOutside';

const buildOutsideEvent = (button: number): Event =>
  ({
    detail: { originalEvent: { button } as PointerEvent },
    preventDefault: vi.fn(),
  }) as unknown as Event;

describe('useIgnoreMiddleClickInteractOutside', () => {
  it('should prevent dismissal for a middle-click outside interaction, e.g. panning the canvas', () => {
    // mock
    const onInteractOutside = vi.fn();

    // before
    const { result } = renderHook(() => useIgnoreMiddleClickInteractOutside(onInteractOutside));
    const event = buildOutsideEvent(1);

    // action
    result.current(event);

    // result
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).not.toHaveBeenCalled();
  });

  it('should forward a left-click outside interaction to the given callback', () => {
    // mock
    const onInteractOutside = vi.fn();

    // before
    const { result } = renderHook(() => useIgnoreMiddleClickInteractOutside(onInteractOutside));
    const event = buildOutsideEvent(0);

    // action
    result.current(event);

    // result
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(onInteractOutside).toHaveBeenCalledWith(event);
  });

  it('should not throw when no callback is given for a left-click outside interaction', () => {
    // before
    const { result } = renderHook(() => useIgnoreMiddleClickInteractOutside(undefined));
    const event = buildOutsideEvent(0);

    // action / result
    expect(() => result.current(event)).not.toThrow();
  });
});
