import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useRulerCanvas } from '../useRulerCanvas';

// others
import { RESIZE_DEBOUNCE_MS } from '../../../constants';

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

describe('useRulerCanvas', () => {
  beforeEach(() => {
    latestResizeCallback = undefined;
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    vi.stubGlobal('devicePixelRatio', 2);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should size the overlay canvas via devicePixelRatio when enabled', () => {
    // mock
    const canvasRef = createCanvasRef(100, 50);

    // before
    renderHook(() => useRulerCanvas(canvasRef, true));

    // result
    expect(canvasRef.current?.width).toBe(200);
    expect(canvasRef.current?.height).toBe(100);
  });

  it('should do nothing while disabled', () => {
    // mock
    const canvasRef = createCanvasRef(100, 50);
    canvasRef.current!.width = 42;

    // before
    renderHook(() => useRulerCanvas(canvasRef, false));

    // result
    expect(canvasRef.current?.width).toBe(42);
  });

  it('should do nothing when the canvas ref is empty', () => {
    // before
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() => renderHook(() => useRulerCanvas(canvasRef, true))).not.toThrow();
  });

  it('should re-size on a debounced observer callback', () => {
    // mock
    vi.useFakeTimers();

    const canvas = document.createElement('canvas');
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };
    const rectSpy = vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 50, width: 100 } as DOMRect);

    // before
    renderHook(() => useRulerCanvas(canvasRef, true));

    // action
    rectSpy.mockReturnValue({ height: 80, width: 200 } as DOMRect);
    latestResizeCallback?.([], {} as ResizeObserver);
    vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);

    // result
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(160);
  });

  it('should disconnect the observer on unmount', () => {
    // spy
    const disconnectSpy = vi.spyOn(ResizeObserverMock.prototype, 'disconnect');

    // before
    const canvasRef = createCanvasRef(10, 10);
    const { unmount } = renderHook(() => useRulerCanvas(canvasRef, true));

    // action
    unmount();

    // result
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
