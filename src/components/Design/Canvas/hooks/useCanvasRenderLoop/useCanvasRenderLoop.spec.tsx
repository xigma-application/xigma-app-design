import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useCanvasRenderLoop } from './useCanvasRenderLoop';

// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setBackgroundPaint } from 'store/design/slice';
import { store } from 'store';

let rafCallback: FrameRequestCallback | undefined;

const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
  rafCallback = callback;

  return 1;
});
const cancelAnimationFrameMock = vi.fn();

type TGlCanvasRef = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  clear: ReturnType<typeof vi.fn>;
  clearColor: ReturnType<typeof vi.fn>;
  colorMask: ReturnType<typeof vi.fn>;
  deleteProgram: ReturnType<typeof vi.fn>;
};

const createGlCanvasRef = (): TGlCanvasRef => {
  const canvas = document.createElement('canvas');
  const clearColor = vi.fn();
  const clear = vi.fn();
  const colorMask = vi.fn();
  const deleteProgram = vi.fn();

  vi.spyOn(canvas, 'getContext').mockReturnValue({
    BLEND: 3042,
    COLOR_BUFFER_BIT: 16384,
    ONE_MINUS_SRC_ALPHA: 771,
    SRC_ALPHA: 770,
    attachShader: vi.fn(),
    blendFunc: vi.fn(),
    clear,
    clearColor,
    colorMask,
    compileShader: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    createProgram: vi.fn(() => ({})),
    createShader: vi.fn(() => ({})),
    deleteBuffer: vi.fn(),
    deleteProgram,
    enable: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getShaderParameter: vi.fn(() => true),
    linkProgram: vi.fn(),
    shaderSource: vi.fn(),
  } as unknown as WebGL2RenderingContext);

  return { canvasRef: { current: canvas }, clear, clearColor, colorMask, deleteProgram };
};

describe('useCanvasRenderLoop behaviors', () => {
  beforeEach(() => {
    rafCallback = undefined;
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);
    store.dispatch(setBackgroundPaint(DEFAULT_PAINT));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    requestAnimationFrameMock.mockClear();
    cancelAnimationFrameMock.mockClear();
  });

  it('should do nothing when the canvas has no WebGL context', () => {
    // before
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: document.createElement('canvas') };

    // result
    expect(() => renderHook(() => useCanvasRenderLoop(createCanvasRefs({ canvasRef })))).not.toThrow();
    expect(requestAnimationFrameMock).not.toHaveBeenCalled();
  });

  it('should draw the background on every frame', () => {
    // mock
    const { canvasRef, clear, clearColor } = createGlCanvasRef();

    // before
    renderHook(() => useCanvasRenderLoop(createCanvasRefs({ canvasRef })));

    // action
    rafCallback?.(0);

    // result
    expect(clearColor).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('should re-enable alpha writes for the background clear, then lock them for foreground drawing', () => {
    // mock
    const { canvasRef, colorMask } = createGlCanvasRef();

    // before
    renderHook(() => useCanvasRenderLoop(createCanvasRefs({ canvasRef })));

    // action
    rafCallback?.(0);

    // result
    expect(colorMask.mock.calls).toEqual([
      [true, true, true, true],
      [true, true, true, false],
    ]);
  });

  it('should schedule the next frame after drawing', () => {
    // mock
    const { canvasRef } = createGlCanvasRef();

    // before
    renderHook(() => useCanvasRenderLoop(createCanvasRefs({ canvasRef })));

    // action
    rafCallback?.(0);

    // result
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(2);
  });

  it('should cancel the scheduled frame on unmount', () => {
    // mock
    const { canvasRef } = createGlCanvasRef();

    // before
    const { unmount } = renderHook(() => useCanvasRenderLoop(createCanvasRefs({ canvasRef })));

    // action
    unmount();

    // result
    expect(cancelAnimationFrameMock).toHaveBeenCalledTimes(1);
  });

  it('should delete all seven compiled programs on unmount', () => {
    // mock
    const { canvasRef, deleteProgram } = createGlCanvasRef();

    // before
    const { unmount } = renderHook(() => useCanvasRenderLoop(createCanvasRefs({ canvasRef })));

    // action
    unmount();

    // result
    expect(deleteProgram).toHaveBeenCalledTimes(7);
  });
});
