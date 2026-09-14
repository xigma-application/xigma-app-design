import { renderHook } from '@testing-library/react';

// hooks
import { useIgnoreGradientCanvasInteractOutside } from '../useIgnoreGradientCanvasInteractOutside';

describe('useIgnoreGradientCanvasInteractOutside', () => {
  it('should prevent the default dismissal for a canvas click while the pointer is over a gradient handle', () => {
    // before
    const { result } = renderHook(() => useIgnoreGradientCanvasInteractOutside(() => true));
    const event = { preventDefault: vi.fn(), target: document.createElement('canvas') } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should leave the interaction alone when the pointer is not over a gradient handle', () => {
    // before
    const { result } = renderHook(() => useIgnoreGradientCanvasInteractOutside(() => false));
    const event = { preventDefault: vi.fn(), target: document.createElement('canvas') } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should leave the interaction alone when the click did not land on a canvas element, even while over a gradient handle', () => {
    // before
    const { result } = renderHook(() => useIgnoreGradientCanvasInteractOutside(() => true));
    const event = { preventDefault: vi.fn(), target: document.createElement('div') } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should leave the interaction alone when no checker function is given at all', () => {
    // before
    const { result } = renderHook(() => useIgnoreGradientCanvasInteractOutside(undefined));
    const event = { preventDefault: vi.fn(), target: document.createElement('canvas') } as unknown as Event;

    // action
    result.current(event);

    // result
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
