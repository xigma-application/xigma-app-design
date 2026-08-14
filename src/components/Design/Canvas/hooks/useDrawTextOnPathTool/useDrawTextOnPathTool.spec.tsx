import { Provider } from 'react-redux';
import { RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useDrawTextOnPathTool } from './useDrawTextOnPathTool';

// store
import { setActiveTool, setSelection, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDraftEntity } from 'types/design/types';

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

const renderTextOnPathTool = (canvasRef: RefObject<HTMLCanvasElement | null>, draftRef: RefObject<TDraftEntity | null>): void => {
  renderHook(() => useDrawTextOnPathTool(canvasRef, draftRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useDrawTextOnPathTool behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
    store.dispatch(stopTextEdit());
  });

  it('should not react to pointer events when the tool is not active', () => {
    // mock
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4000, 4000));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4020, 4020));

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should show an ellipse-shaped path draft while dragging', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4100, 4100));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4150, 4140));

    // result
    expect(draftRef.current).toEqual({ height: 40, pathType: 'ellipse', type: NodeType.path, width: 50, x: 4100, y: 4100 });
  });

  it('should create a path node and immediately start editing text on it when the drag completes', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4200, 4200));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4250, 4240));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 4250, 4240));

    // result
    const { design } = store.getState();
    const [pathNodeId] = design.rootOrder;

    expect(design.nodes[pathNodeId]).toMatchObject({ height: 40, pathType: 'ellipse', type: NodeType.path, width: 50, x: 4200, y: 4200 });
    expect(design.selectedIds).toEqual([pathNodeId]);
    expect(design.editingTextBox).toMatchObject({ height: 40, pathId: pathNodeId, pathStartOffset: 0, width: 50, x: 4200, y: 4200 });
    expect(design.activeTool).toBe(ToolName.default);
    expect(draftRef.current).toBeNull();
  });

  it('should ignore a non-primary button press', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4300, 4300, 1));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4350, 4340));

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should switch back to the default tool without creating a node when the drag is too small', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 4400, 4400));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 4400, 4400));

    // result
    const { design } = store.getState();

    expect(design.editingTextBox).toBeNull();
    expect(design.activeTool).toBe(ToolName.default);
  });

  it('should ignore a pointer-up that was not preceded by a pointer-down', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.textOnPath));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderTextOnPathTool(canvasRef, draftRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 4500, 4500));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.textOnPath);
  });
});
