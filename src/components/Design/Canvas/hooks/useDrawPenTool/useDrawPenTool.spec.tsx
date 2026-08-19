import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useDrawPenTool } from './useDrawPenTool';

// store
import { setActiveTool, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent(type, { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const renderPenTool = (canvasRef: RefObject<HTMLCanvasElement | null>): TCanvasRefs => {
  const refs = createCanvasRefs({ canvasRef });

  renderHook(() => useDrawPenTool(refs), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return refs;
};

describe('useDrawPenTool behaviors', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should not react to pointer events when the pen tool is not active', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderPenTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // result
    expect(store.getState().design.vectorEditingNodeId).toBeNull();
  });

  it('should start a new vector network on pointerdown when the pen tool is active', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before
    renderPenTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 20));
    });

    // result
    const { vectorEditingNodeId } = store.getState().design;

    expect(vectorEditingNodeId).not.toBeNull();
    expect(canvasRef.current?.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should carry a pointerdown/pointermove/pointerup gesture through to a second connected vertex', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before
    renderPenTool(canvasRef);

    // action — first click plants vertex 1
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });

    const nodeId = store.getState().design.vectorEditingNodeId as string;

    // action — second click plants vertex 2 and connects it back to vertex 1
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 100, 0));
    });

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(Object.keys(node.segments)).toHaveLength(1);
  });

  it('should preview the pen line toward the pointer on pointermove while a vertex is active', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before
    const refs = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 0));
    });

    // result
    expect(refs.penPreviewRef.current).toMatchObject({ to: { x: 40, y: 0 } });
  });

  it('should reset the in-progress drag on pointercancel', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before
    renderPenTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointercancel', 0, 0));
    });

    // result
    expect(canvasRef.current?.releasePointerCapture).toHaveBeenCalledWith(1);
  });
});
