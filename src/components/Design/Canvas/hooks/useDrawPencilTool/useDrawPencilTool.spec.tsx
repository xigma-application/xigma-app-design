import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useDrawPencilTool } from './useDrawPencilTool';

// store
import { selectActivePage } from 'store/design/selectors';
import { setActiveTool, setSelection } from 'store/design/slice';
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

const renderPencilTool = (canvasRef: RefObject<HTMLCanvasElement | null>): { refs: TCanvasRefs } => {
  const refs = createCanvasRefs({ canvasRef });

  renderHook(() => useDrawPencilTool(refs), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return { refs };
};

describe('useDrawPencilTool behaviors', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should not react to pointer events when the pencil tool is not active', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderPencilTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });

    // result
    expect(canvasRef.current?.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should carry a full pointerdown/pointermove/pointerup drag through to a committed vector node', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pencil));

    // before
    const { refs } = renderPencilTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 30, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 30, 0));
    });

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());
    const node = nodes[rootOrder[rootOrder.length - 1]] as TVectorNode;

    expect(node.type).toBe('vector');
    expect(node.capStyle).toBe('round');
    expect(refs.pencil.pencilPreviewPointsRef.current).toBeNull();
    expect(canvasRef.current?.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should re-evaluate the live preview immediately when Shift is pressed, without waiting for a further pointermove', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pencil));

    // before — start a stroke and move once, off any cardinal direction
    const { refs } = renderPencilTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 12));
    });

    // action — Shift held, then a further mostly-horizontal move locks the x axis right away
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 40, 15, { shiftKey: true }));
    });

    // result — the preview's last point holds the anchor's y (12), not the raw cursor's y (15)
    const preview = refs.pencil.pencilPreviewPointsRef.current as { x: number; y: number }[];

    expect(preview[preview.length - 1]).toEqual({ x: 40, y: 12 });
  });

  it('should re-evaluate again on keyup once Shift is released, dropping the axis lock', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pencil));

    // before — start a stroke, move to lock an axis, then release Shift with no further movement
    const { refs } = renderPencilTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 12, { shiftKey: true }));
    });

    const previewWhileLocked = refs.pencil.pencilPreviewPointsRef.current;

    // action
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', shiftKey: false }));
    });

    // result — the locked axis point gets committed to the tail (holding y at the anchor), then
    // freehand sampling resumes from there, both landing in the same move since the cursor never
    // actually moved between the two — proving the lock dropped, not that it's still constraining
    expect(refs.pencil.pencilPreviewPointsRef.current).not.toEqual(previewWhileLocked);
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 12 },
    ]);
  });

  it('should ignore non-Shift keys and do nothing when no pointer position is known yet', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pencil));

    // before
    const { refs } = renderPencilTool(canvasRef);

    // action — a key other than Shift, before any pointer event has ever fired
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 'Alt' }));
    });

    // result
    expect(refs.pencil.pencilPreviewPointsRef.current).toBeNull();
  });

  it('should clear all in-progress stroke state once the tool leaves Pencil', () => {
    // mock
    const canvasRef = createCanvasRef();

    store.dispatch(setActiveTool(ToolName.pencil));

    // before
    const { refs } = renderPencilTool(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 30, 0));
    });

    expect(refs.pencil.pencilPreviewPointsRef.current).not.toBeNull();

    // action
    act(() => {
      store.dispatch(setActiveTool(ToolName.default));
    });

    // result
    expect(refs.pencil.pencilPreviewPointsRef.current).toBeNull();
  });
});
