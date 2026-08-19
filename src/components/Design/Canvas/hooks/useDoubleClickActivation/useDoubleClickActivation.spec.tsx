import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useDoubleClickActivation } from './useDoubleClickActivation';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return { current: canvas };
};

const doubleClickEvent = (x: number, y: number): MouseEvent => new MouseEvent('dblclick', { clientX: x, clientY: y });

const renderActivation = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  isBlocked: boolean,
  getTarget: () => string | null,
  onHit: (target: string) => void,
): void => {
  renderHook(() => useDoubleClickActivation(createCanvasRefs({ canvasRef }), isBlocked, getTarget, onHit), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useDoubleClickActivation behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should call onHit and stop the event from bubbling when getTarget finds a hit', () => {
    // mock
    const canvasRef = createCanvasRef();
    const getTarget = vi.fn().mockReturnValue('target-1');
    const onHit = vi.fn();
    const event = doubleClickEvent(10, 10);

    // spy
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    // before
    renderActivation(canvasRef, false, getTarget, onHit);

    // action
    canvasRef.current?.dispatchEvent(event);

    // result
    expect(onHit).toHaveBeenCalledWith('target-1');
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should not call onHit when getTarget finds no hit', () => {
    // mock
    const canvasRef = createCanvasRef();
    const getTarget = vi.fn().mockReturnValue(null);
    const onHit = vi.fn();

    // before
    renderActivation(canvasRef, false, getTarget, onHit);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(10, 10));

    // result
    expect(onHit).not.toHaveBeenCalled();
  });

  it('should not react when isBlocked is true', () => {
    // mock
    const canvasRef = createCanvasRef();
    const getTarget = vi.fn().mockReturnValue('target-1');
    const onHit = vi.fn();

    // before
    renderActivation(canvasRef, true, getTarget, onHit);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(10, 10));

    // result
    expect(onHit).not.toHaveBeenCalled();
  });

  it('should not react when the active tool is not the default selection tool', () => {
    // mock
    const canvasRef = createCanvasRef();
    const getTarget = vi.fn().mockReturnValue('target-1');
    const onHit = vi.fn();

    store.dispatch(setActiveTool(ToolName.pen));

    // before
    renderActivation(canvasRef, false, getTarget, onHit);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(10, 10));

    // result
    expect(onHit).not.toHaveBeenCalled();
  });
});
