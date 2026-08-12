import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { useHandTool } from './useHandTool';

// store
import { setActiveTool, setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TViewport } from 'types/design/types';

const DEFAULT_VIEWPORT: TViewport = { x: 0, y: 0, zoom: 1 };

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  // jsdom doesn't implement pointer capture on elements
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent(type, { button, clientX: x, clientY: y, pointerId: 1 });

const renderHandTool = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useHandTool(canvasRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useHandTool behaviors', () => {
  beforeEach(() => {
    // reset the singleton store's viewport/activeTool, since handlePointerMove reads the viewport
    // directly and state otherwise leaks between tests in this file
    store.dispatch(setViewport(DEFAULT_VIEWPORT));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should pan the viewport by the drag delta while the primary mouse button is held', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    // before
    renderHandTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));

    // result
    expect(store.getState().design.viewport).toEqual({ x: 30, y: 15, zoom: 1 });
  });

  it('should not react to a middle-button drag', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    // before
    renderHandTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, 1));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });

  it('should not attach listeners when the hand tool is not active', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderHandTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
    expect(canvasRef.current?.className).not.toContain('hand');
  });

  it('should show the idle hand cursor while active, and the pressing cursor while dragging', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    // before
    renderHandTool(canvasRef);

    // result
    expect(canvasRef.current?.className).toContain('hand');
    expect(canvasRef.current?.className).not.toContain('pressing');

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // result
    expect(canvasRef.current?.className).toContain('pressing');
    expect(canvasRef.current?.className).not.toContain('hand');

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 40, 25));

    // result
    expect(canvasRef.current?.className).toContain('hand');
    expect(canvasRef.current?.className).not.toContain('pressing');
  });

  it('should do nothing when the canvas has no element yet', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    store.dispatch(setActiveTool(ToolName.hand));

    // result
    expect(() => renderHandTool(canvasRef)).not.toThrow();
  });

  it('should ignore a pointer-up that was not preceded by a pointer-down', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    // before
    renderHandTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));

    // result
    expect(canvasRef.current?.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should stop panning once the button is released', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    // before
    renderHandTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 999, 999));

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });

  it('should remove the cursor classes and stop panning once the tool switches away', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    // before
    renderHandTool(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // action
    act(() => store.dispatch(setActiveTool(ToolName.default)));

    // result
    expect(canvasRef.current?.className).not.toContain('hand');
    expect(canvasRef.current?.className).not.toContain('pressing');

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 999, 999));
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });
});
