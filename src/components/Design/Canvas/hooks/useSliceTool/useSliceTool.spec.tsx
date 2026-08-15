import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { useSliceTool } from './useSliceTool';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TSliceDraft } from './types';

// utils
import { DEFAULT_CURSOR } from 'utils/canvas/defaultCursor';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent(type, { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const renderSliceTool = (canvasRef: RefObject<HTMLCanvasElement | null>): RefObject<TSliceDraft | null> => {
  const sliceRef: RefObject<TSliceDraft | null> = { current: null };

  renderHook(() => useSliceTool(canvasRef, sliceRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return sliceRef;
};

describe('useSliceTool behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should not react to pointer events when the slice tool is not active', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderSliceTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 60));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 60, 60));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should draw a slice box on drag and keep the slice tool active once it exists', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.slice));

    const canvasRef = createCanvasRef();

    // before
    const sliceRef = renderSliceTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 100));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 150, 160));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 150, 160));

    // result
    expect(sliceRef.current).toEqual({ height: 60, rotation: 0, width: 50, x: 100, y: 100 });
    expect(store.getState().design.activeTool).toBe(ToolName.slice);
    expect(canvasRef.current?.style.cursor).toBe(DEFAULT_CURSOR);
  });

  it('should discard a too-small draw and revert to the default tool', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.slice));

    const canvasRef = createCanvasRef();

    // before
    const sliceRef = renderSliceTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 200, 200));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 200, 200));

    // result
    expect(sliceRef.current).toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should resize an existing slice box by dragging its corner handle', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.slice));

    const canvasRef = createCanvasRef();

    // before
    const sliceRef = renderSliceTool(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 300, 300));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 350, 350));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 350, 350));

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 350, 350));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 380, 380));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 380, 380));

    // result
    expect(sliceRef.current).toEqual({ height: 80, rotation: 0, width: 80, x: 300, y: 300 });
  });

  it('should move an existing slice box by dragging its body', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.slice));

    const canvasRef = createCanvasRef();

    // before
    const sliceRef = renderSliceTool(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 400, 400));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 450, 450));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 450, 450));

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 420, 420));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 430, 440));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 430, 440));

    // result
    expect(sliceRef.current).toEqual({ height: 50, rotation: 0, width: 50, x: 410, y: 420 });
  });

  it('should discard the slice and revert to the default tool when clicking outside it', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.slice));

    const canvasRef = createCanvasRef();

    // before
    const sliceRef = renderSliceTool(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 500, 500));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 550, 550));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 550, 550));

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 900, 900));

    // result
    expect(sliceRef.current).toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should ignore a non-primary button press', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.slice));

    const canvasRef = createCanvasRef();

    // before
    const sliceRef = renderSliceTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, { button: 1 }));

    // result
    expect(sliceRef.current).toBeNull();
  });

  it('should clear the slice and reset the cursor when the tool is switched away', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.slice));

    const canvasRef = createCanvasRef();

    const sliceRef = renderSliceTool(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 600, 600));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 650, 650));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 650, 650));

    expect(sliceRef.current).not.toBeNull();

    // action
    act(() => store.dispatch(setActiveTool(ToolName.default)));

    // result
    expect(sliceRef.current).toBeNull();
    expect(canvasRef.current?.style.cursor).toBe('');
  });
});
