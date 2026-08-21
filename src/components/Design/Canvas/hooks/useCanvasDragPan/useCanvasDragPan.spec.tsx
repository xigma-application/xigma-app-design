import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// components
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useCanvasDragPan } from './useCanvasDragPan';
import { useClassNames } from 'components/Design/core/ClassNamesProvider/hooks/useClassNames';

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

const renderDragPan = (canvasRef: RefObject<HTMLCanvasElement | null>): RefObject<string | null> => {
  const classNameRef: RefObject<string | null> = { current: null };

  renderHook(
    () => {
      useCanvasDragPan(createCanvasRefs({ canvasRef }));
      classNameRef.current = useClassNames().className;
    },
    {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    },
  );

  return classNameRef;
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
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));
    });

    // result
    expect(store.getState().design.viewport).toEqual({ x: 30, y: 15, zoom: 1 });
  });

  it('should not react to a left-button drag', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDragPan(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, 0));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));
    });

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });

  it('should apply the pressing cursor class while dragging and remove it on release', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    const classNameRef = renderDragPan(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    });

    // result
    expect(classNameRef.current).toBe('pressing');

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 40, 25));
    });

    // result
    expect(classNameRef.current).toBeNull();
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
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

    // result
    expect(canvasRef.current?.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should stop panning once the button is released', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDragPan(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 999, 999));
    });

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });
});
