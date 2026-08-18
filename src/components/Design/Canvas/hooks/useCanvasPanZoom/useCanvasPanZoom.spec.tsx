import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useCanvasPanZoom } from './useCanvasPanZoom';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { TViewport } from 'types/design/types';

const DEFAULT_VIEWPORT: TViewport = { x: 0, y: 0, zoom: 1 };

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return { current: canvas };
};

const wheelEvent = (deltaX: number, deltaY: number, ctrlKey = false, metaKey = false): WheelEvent =>
  new WheelEvent('wheel', { clientX: 50, clientY: 50, ctrlKey, deltaX, deltaY, metaKey });

describe('useCanvasPanZoom behaviors', () => {
  beforeEach(() => {
    // reset the singleton store's viewport, since handleWheel reads it directly and state
    // otherwise leaks between tests in this file
    store.dispatch(setViewport(DEFAULT_VIEWPORT));
  });

  it('should pan the viewport on a plain wheel scroll', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useCanvasPanZoom(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(wheelEvent(10, 20));

    // result
    expect(store.getState().design.viewport).toEqual({ x: -10, y: -20, zoom: 1 });
  });

  it('should zoom the viewport on a ctrl+wheel scroll', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useCanvasPanZoom(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(wheelEvent(0, -100, true));

    // result
    expect(store.getState().design.viewport.zoom).toBeGreaterThan(1);
  });

  it('should zoom the viewport on a cmd+wheel scroll (macOS)', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useCanvasPanZoom(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(wheelEvent(0, -100, false, true));

    // result
    expect(store.getState().design.viewport.zoom).toBeGreaterThan(1);
  });

  it('should do nothing when the canvas has no element yet', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() =>
      renderHook(() => useCanvasPanZoom(createCanvasRefs({ canvasRef })), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      }),
    ).not.toThrow();
  });

  it('should prevent the browser default scroll/pinch behavior', () => {
    // mock
    const canvasRef = createCanvasRef();

    renderHook(() => useCanvasPanZoom(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    const event = wheelEvent(5, 5);
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // action
    canvasRef.current?.dispatchEvent(event);

    // result
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
