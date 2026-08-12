import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useCanvasResize } from './useCanvasResize';

// others
import { RESIZE_DEBOUNCE_MS } from '../../constants';

let latestResizeCallback: ResizeObserverCallback | undefined;

class ResizeObserverMock {
  constructor(callback: ResizeObserverCallback) {
    latestResizeCallback = callback;
  }

  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

const createCanvasRef = (width: number, height: number): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height, width } as DOMRect);

  return { current: canvas };
};

describe('useCanvasResize behaviors', () => {
  beforeEach(() => {
    latestResizeCallback = undefined;
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should size the canvas using devicePixelRatio', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 2);

    const canvasRef = createCanvasRef(100, 50);

    // before
    renderHook(() => useCanvasResize(canvasRef));

    // result
    expect(canvasRef.current?.width).toBe(200);
    expect(canvasRef.current?.height).toBe(100);
  });

  it('should do nothing when the canvas ref is empty', () => {
    // before
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() => renderHook(() => useCanvasResize(canvasRef))).not.toThrow();
  });

  it('should resize again when the observed element resizes', () => {
    // mock
    vi.useFakeTimers();
    vi.stubGlobal('devicePixelRatio', 1);

    const canvas = document.createElement('canvas');
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };

    // spy
    const rectSpy = vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 50, width: 100 } as DOMRect);

    // before
    renderHook(() => useCanvasResize(canvasRef));

    // action
    rectSpy.mockReturnValue({ height: 80, width: 200 } as DOMRect);
    latestResizeCallback?.([], {} as ResizeObserver);

    // wait
    vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);

    // result
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(80);
  });

  it('should debounce rapid successive resizes into a single recalculation', () => {
    // mock
    vi.useFakeTimers();
    vi.stubGlobal('devicePixelRatio', 1);

    const canvas = document.createElement('canvas');
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };

    // spy
    const rectSpy = vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 50, width: 100 } as DOMRect);

    // before
    renderHook(() => useCanvasResize(canvasRef));

    // action
    rectSpy.mockReturnValue({ height: 60, width: 120 } as DOMRect);
    latestResizeCallback?.([], {} as ResizeObserver);
    rectSpy.mockReturnValue({ height: 80, width: 200 } as DOMRect);
    latestResizeCallback?.([], {} as ResizeObserver);

    // result
    expect(canvas.width).toBe(100);

    // wait
    vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);

    // result
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(80);
  });

  it('should disconnect the resize observer on unmount', () => {
    // spy
    const disconnectSpy = vi.spyOn(ResizeObserverMock.prototype, 'disconnect');

    // before
    const canvasRef = createCanvasRef(10, 10);
    const { unmount } = renderHook(() => useCanvasResize(canvasRef));

    // action
    unmount();

    // result
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
