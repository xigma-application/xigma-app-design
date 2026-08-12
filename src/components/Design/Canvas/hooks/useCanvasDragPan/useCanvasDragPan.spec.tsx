import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useCanvasDragPan } from './useCanvasDragPan';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

// types
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

const pointerEvent = (type: string, x: number, y: number, button = 1): PointerEvent =>
  new PointerEvent(type, { button, clientX: x, clientY: y, pointerId: 1 });

const renderDragPan = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useCanvasDragPan(canvasRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useCanvasDragPan behaviors', () => {
  beforeEach(() => {
    // reset the singleton store's viewport, since handlePointerMove reads it directly and state
    // otherwise leaks between tests in this file
    store.dispatch(setViewport(DEFAULT_VIEWPORT));
  });

  it('should pan the viewport by the drag delta while the middle mouse button is held', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDragPan(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));

    // result
    expect(store.getState().design.viewport).toEqual({ x: 30, y: 15, zoom: 1 });
  });

  it('should not react to a left-button drag', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDragPan(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, 0));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });

  it('should apply the pressing cursor class while dragging and remove it on release', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDragPan(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // result
    expect(canvasRef.current?.className).toContain('pressing');

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 40, 25));

    // result
    expect(canvasRef.current?.className).not.toContain('pressing');
  });

  it('should do nothing when the canvas has no element yet', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() => renderDragPan(canvasRef)).not.toThrow();
  });

  it('should ignore a pointer-up that was not preceded by a pointer-down', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDragPan(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));

    // result
    expect(canvasRef.current?.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should stop panning once the button is released', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDragPan(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 999, 999));

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });
});
