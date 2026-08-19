import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// components
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';
import { useDrawPenTool } from './useDrawPenTool';

// store
import { setActiveTool, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
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

const renderPenTool = (canvasRef: RefObject<HTMLCanvasElement | null>): { getClassName: () => string | null; refs: TCanvasRefs } => {
  const refs = createCanvasRefs({ canvasRef });

  const { result } = renderHook(
    () => {
      useDrawPenTool(refs);
      return useClassNames();
    },
    {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    },
  );

  return { getClassName: () => result.current.className, refs };
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

  it('should close the network back onto the starting point without doubling the segment — A -> B -> A', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before
    renderPenTool(canvasRef);

    // action — first click plants vertex A
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });

    const nodeId = store.getState().design.vectorEditingNodeId as string;

    // action — second click plants vertex B, connecting A -> B
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 100, 0));
    });

    // action — third click lands back on A, closing the network instead of adding a duplicate segment
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(Object.keys(node.segments)).toHaveLength(1);
    expect(store.getState().design.penActiveVertexId).toBeNull();
  });

  it('should preview the pen line toward the pointer on pointermove while a vertex is active', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before
    const { getClassName, refs } = renderPenTool(canvasRef);

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

    // result — not near any other vertex, so the cursor stays the plain pen
    expect(refs.penPreviewRef.current).toMatchObject({ to: { x: 40, y: 0 } });
    expect(getClassName()).toBe('pen');
  });

  it('should switch the cursor to pen-snap while extending, once the pointer hovers close enough to snap the rubber-band onto another vertex', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — v1 at (0,0), v2 at (100,0)
    const { getClassName } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 100, 0));
    });

    // action — hover back onto v1, well within the snap radius
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1, 1));
    });

    // result
    expect(getClassName()).toBe('pen-snap');
  });

  it('should switch the cursor to pen-snap when hovering an existing vertex with no vertex currently active', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — place a single vertex at (0,0), then stop extending from it
    const { getClassName } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      store.dispatch(setPenActiveVertexId(null));
    });

    // action — hover back onto that same vertex
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1, 1));
    });

    // result
    expect(getClassName()).toBe('pen-snap');
  });

  it('should clear the floating next-point preview dot once the tool leaves Pen, instead of leaving it stuck on screen', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before
    const { refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 0));
    });

    expect(refs.penNewVertexPreviewRef.current).toEqual({ x: 40, y: 0 });

    // action
    act(() => {
      store.dispatch(setActiveTool(ToolName.default));
    });

    // result
    expect(refs.penNewVertexPreviewRef.current).toBeNull();
  });

  it('should switch the cursor to pen-extend and attract the preview onto the segment when hovering its interior with no vertex currently active', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — place v1 at (0,0) and v2 at (100,0), connected by one segment, then stop extending
    const { getClassName, refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 100, 0));
    });
    act(() => {
      store.dispatch(setPenActiveVertexId(null));
    });

    // action — hover near the far end of the segment, well outside the midpoint's snap radius
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 90, 2));
    });

    // result
    expect(getClassName()).toBe('pen-extend');
    expect(refs.penNewVertexPreviewRef.current).toEqual({ x: 90, y: 0 });
    expect(refs.hoveredSegmentIdRef.current).not.toBeNull();
  });

  it('should switch the cursor to pen-snap and lock the preview onto the exact midpoint when hovering close enough to it', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — place v1 at (0,0) and v2 at (100,0), connected by one segment, then stop extending
    const { getClassName, refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 100, 0));
    });
    act(() => {
      store.dispatch(setPenActiveVertexId(null));
    });

    // action — hover a couple of px off the segment's midpoint (50,0)
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 50, 2));
    });

    // result
    expect(getClassName()).toBe('pen-snap');
    expect(refs.penNewVertexPreviewRef.current).toEqual({ x: 50, y: 0 });
    expect(refs.hoveredSegmentIdRef.current).not.toBeNull();
  });

  it('should clear the hovered-segment highlight once the tool leaves Pen', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — place v1 at (0,0) and v2 at (100,0), connected by one segment, then stop extending
    const { refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 100, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 100, 0));
    });
    act(() => {
      store.dispatch(setPenActiveVertexId(null));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 50, 2));
    });

    expect(refs.hoveredSegmentIdRef.current).not.toBeNull();

    // action
    act(() => {
      store.dispatch(setActiveTool(ToolName.default));
    });

    // result
    expect(refs.hoveredSegmentIdRef.current).toBeNull();
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
