import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createGuideRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useGuideRefs/createGuideRefs';
import { useRulerRenderLoop } from '../useRulerRenderLoop';

// others
import { RULER_SIZE_PX } from '../../constants';

const createFakeContext = (): Record<string, ReturnType<typeof vi.fn>> => ({
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  setTransform: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
});

const createInsetRefs = (
  leftPanelWidth = 0,
  rightPanelWidth = 0,
): { leftPanelWidthRef: RefObject<number>; rightPanelWidthRef: RefObject<number> } => ({
  leftPanelWidthRef: { current: leftPanelWidth },
  rightPanelWidthRef: { current: rightPanelWidth },
});

describe('useRulerRenderLoop', () => {
  let fakeContext: Record<string, ReturnType<typeof vi.fn>>;
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    fakeContext = createFakeContext();
    rafCallbacks = [];

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeContext as unknown as CanvasRenderingContext2D);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);

      return rafCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should paint the ruler on each scheduled frame while enabled', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: document.createElement('canvas') };

    // before — mount only schedules the first frame
    renderHook(() => useRulerRenderLoop(canvasRef, true, createInsetRefs(), createGuideRefs()));
    expect(rafCallbacks).toHaveLength(1);

    // action — run the first scheduled frame
    rafCallbacks[rafCallbacks.length - 1](0);

    // result
    expect(fakeContext.setTransform).toHaveBeenCalledTimes(1);
    expect(fakeContext.clearRect).toHaveBeenCalledTimes(1);

    // action — run the next scheduled frame
    rafCallbacks[rafCallbacks.length - 1](0);

    // result
    expect(fakeContext.clearRect).toHaveBeenCalledTimes(2);
  });

  it('should read the current panel insets on every frame and draw the left strip flush against them', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: document.createElement('canvas') };
    const insetRefs = createInsetRefs(300, 0);

    // before
    renderHook(() => useRulerRenderLoop(canvasRef, true, insetRefs, createGuideRefs()));
    rafCallbacks[rafCallbacks.length - 1](0);

    // result — left strip painted starting at the reported leftPanelWidth, not 0
    expect(fakeContext.fillRect).toHaveBeenCalledWith(300, 0, RULER_SIZE_PX, 0);

    // action — the panel resizes live, no re-render needed
    insetRefs.leftPanelWidthRef.current = 320;
    rafCallbacks[rafCallbacks.length - 1](0);

    // result
    expect(fakeContext.fillRect).toHaveBeenCalledWith(320, 0, RULER_SIZE_PX, 0);
  });

  it('should cancel the animation frame on unmount', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: document.createElement('canvas') };

    // before
    const { unmount } = renderHook(() => useRulerRenderLoop(canvasRef, true, createInsetRefs(), createGuideRefs()));

    // action
    unmount();

    // result
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('should do nothing while disabled', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: document.createElement('canvas') };

    // before
    renderHook(() => useRulerRenderLoop(canvasRef, false, createInsetRefs(), createGuideRefs()));

    // result
    expect(fakeContext.clearRect).not.toHaveBeenCalled();
  });

  it('should do nothing when the canvas ref is empty', () => {
    // before
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() => renderHook(() => useRulerRenderLoop(canvasRef, true, createInsetRefs(), createGuideRefs()))).not.toThrow();
  });

  it('should fall back to a device pixel ratio of 1 when the browser reports none', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 0);
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: document.createElement('canvas') };

    // before
    renderHook(() => useRulerRenderLoop(canvasRef, true, createInsetRefs(), createGuideRefs()));
    rafCallbacks[rafCallbacks.length - 1](0);

    // result
    expect(fakeContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
  });
});
