import { fireEvent, renderHook, waitFor } from '@testing-library/react';

// hooks
import { useMouseMoveEvent } from '../useMouseMoveEvent';

vi.mock('lodash', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lodash')>()),
  throttle: (callback: (event: MouseEvent) => void): ((event: MouseEvent) => void) => callback,
}));

vi.mock('utils/canvas/colorPixelSampler/colorPixelSamplerRegistry', () => ({
  sampleColorPixels: vi.fn().mockResolvedValue([{ a: 255, b: 1, g: 2, r: 3 }]),
}));

describe('useMouseMoveEvent', () => {
  it('should track the pointer position on move', () => {
    // mock
    const setColors = vi.fn();
    const setMousePosition = vi.fn();

    // before
    renderHook(() => useMouseMoveEvent(setColors, setMousePosition));

    // action
    fireEvent.mouseMove(window, { clientX: 12, clientY: 34 });

    // result
    expect(setMousePosition).toHaveBeenCalledWith({ x: 12, y: 34 });
  });

  it('should sample the color at the pointer on every move', async () => {
    // mock
    const setColors = vi.fn();
    const setMousePosition = vi.fn();

    // before
    renderHook(() => useMouseMoveEvent(setColors, setMousePosition));

    // action
    fireEvent.mouseMove(window, { clientX: 12, clientY: 34 });

    // result
    await waitFor(() => expect(setColors).toHaveBeenCalledWith([{ a: 255, b: 1, g: 2, r: 3 }]));
  });

  it('should stop listening once unmounted', () => {
    // mock
    const setColors = vi.fn();
    const setMousePosition = vi.fn();

    // before
    const { unmount } = renderHook(() => useMouseMoveEvent(setColors, setMousePosition));

    unmount();

    // action
    fireEvent.mouseMove(window, { clientX: 12, clientY: 34 });

    // result
    expect(setMousePosition).not.toHaveBeenCalled();
  });
});
