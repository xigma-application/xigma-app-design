import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// core
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

  it('should clear the stale rubber-band preview line as soon as a new point is placed, instead of leaving it pointing at the just-placed vertex', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — place v1, then hover to build up a rubber-band preview toward (40, 0)
    const { refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 0));
    });

    expect(refs.penPreviewRef.current).not.toBeNull();

    // action — click there to place v2; the old rubber-band must not linger through the click-drag
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 40, 0));
    });

    // result
    expect(refs.penPreviewRef.current).toBeNull();
  });

  it('should track the live cursor position for the drag-preview handle while dragging, then clear it on release', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — first click plants vertex 1
    const { refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });

    // action — drag out a handle without releasing yet
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 5));
    });

    expect(refs.penDraggedHandlePositionRef.current).toEqual({ x: 20, y: 5 });

    // action — release
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 20, 5));
    });

    // result
    expect(refs.penDraggedHandlePositionRef.current).toBeNull();
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

  it('should re-evaluate the rubber-band preview immediately when Shift is pressed, without waiting for the pointer to move', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — place v1, then hover at a diagonal position nowhere near a cardinal direction
    const { refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 12));
    });

    expect(refs.penPreviewRef.current?.isSnapped).toBe(false);

    // action — Shift held, no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });

    // result — hard-constrained to the nearest 15deg increment right away
    expect(refs.penPreviewRef.current?.isSnapped).toBe(true);
    expect(refs.penPreviewRef.current?.to).not.toEqual({ x: 20, y: 12 });
  });

  it('should re-evaluate an in-progress tangent-handle drag immediately when Shift is pressed, without a further pointermove', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    // before — place v1, press down on v2, then drag out past the minimum distance at an off-cardinal
    // diagonal position, establishing an unsnapped in-progress drag
    const { refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 12));
    });

    expect(refs.penDraggedHandleIsSnappedRef.current).toBe(false);

    // action — Shift held, no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });

    // result — hard-constrained at the same live position, no additional mouse movement needed
    expect(refs.penDraggedHandleIsSnappedRef.current).toBe(true);
    expect(refs.penDraggedHandlePositionRef.current).not.toEqual({ x: 20, y: 12 });
  });

  it('should re-evaluate again on keyup once Shift is released, dropping the hard constraint', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    const { refs } = renderPenTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 12));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });

    expect(refs.penPreviewRef.current?.isSnapped).toBe(true);

    // action — Shift released, still no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', shiftKey: false }));
    });

    // result — back to the plain tolerance-based snap, which this diagonal angle falls outside of
    expect(refs.penPreviewRef.current?.isSnapped).toBe(false);
    expect(refs.penPreviewRef.current?.to).toEqual({ x: 20, y: 12 });
  });

  it('should ignore non-Shift keys and do nothing when no pointer position is known yet', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pen));

    const { refs } = renderPenTool(canvasRef);

    // action — a key other than Shift, before any pointer event has ever fired
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 'Alt' }));
    });

    // result
    expect(refs.penPreviewRef.current).toBeNull();
  });
});
