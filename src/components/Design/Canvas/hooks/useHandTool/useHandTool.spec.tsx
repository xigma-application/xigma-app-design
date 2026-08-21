import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// components
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useClassNames } from 'components/Design/core/ClassNamesProvider/hooks/useClassNames';
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

const renderHandTool = (canvasRef: RefObject<HTMLCanvasElement | null>): RefObject<string | null> => {
  const classNameRef: RefObject<string | null> = { current: null };

  renderHook(
    () => {
      useHandTool(createCanvasRefs({ canvasRef }));
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

describe('useHandTool behaviors', () => {
  beforeEach(() => {
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
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));
    });

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
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, 1));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));
    });

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });

  it('should not attach listeners when the hand tool is not active', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    const classNameRef = renderHandTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 25));
    });

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
    expect(classNameRef.current).not.toBe('hand');
  });

  it('should show the idle hand cursor while active, and the pressing cursor while dragging', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    // before
    const classNameRef = renderHandTool(canvasRef);

    // result
    expect(classNameRef.current).toBe('hand');

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
    expect(classNameRef.current).toBe('hand');
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
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

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
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 999, 999));
    });

    // result
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });

  it('should remove the cursor classes and stop panning once the tool switches away', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.hand));

    // before
    const classNameRef = renderHandTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    });

    // action
    act(() => store.dispatch(setActiveTool(ToolName.default)));

    // result
    expect(classNameRef.current).not.toBe('hand');
    expect(classNameRef.current).not.toBe('pressing');

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 999, 999));
    });
    expect(store.getState().design.viewport).toEqual(DEFAULT_VIEWPORT);
  });
});
