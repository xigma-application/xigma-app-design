import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useTextEditOnDoubleClick } from './useTextEditOnDoubleClick';

// store
import { addNode, setActiveTool, setSelection, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return { current: canvas };
};

const doubleClickEvent = (x: number, y: number): MouseEvent => new MouseEvent('dblclick', { clientX: x, clientY: y });

const addTextNode = (x: number, y: number, content = 'Hi', size = 500, flipX = false, flipY = false, rotation = 0): string => {
  store.dispatch(
    addNode({
      content,
      fill: '#ffffff',
      flipX,
      flipY,
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
      rotation,
      type: NodeType.text,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addPathTextNode = (x: number, y: number, size = 500): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
      pathFlip: true,
      pathId: 'ellipse-1',
      pathStartOffset: 0.25,
      rotation: 0,
      type: NodeType.text,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const renderDoubleClickTool = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useTextEditOnDoubleClick(canvasRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useTextEditOnDoubleClick behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
    store.dispatch(stopTextEdit());
  });

  it('should start editing an unselected text node when double-clicked on its rendered content', () => {
    // mock
    const idA = addTextNode(2000, 2000);
    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action — close to the "Hi" glyphs near the top-left of the box
    canvasRef.current?.dispatchEvent(doubleClickEvent(2002, 2002));

    // result
    const { design } = store.getState();

    expect(design.editingNodeId).toBe(idA);
    expect(design.editingTextBox).toEqual({ flipX: false, flipY: false, height: 500, rotation: 0, width: 500, x: 2000, y: 2000 });
    expect(design.editingTextContent).toBe('Hi');
    expect(design.selectedIds).toEqual([idA]);
  });

  it("should carry a rotated, mirrored node's rotation and flip into the editing box, not reset them to zero", () => {
    // mock — select first, then double-click the node's own center (invariant under its own rotation)
    const idA = addTextNode(2500, 2500, 'Hi', 500, true, true, 45);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(2750, 2750));

    // result
    const { design } = store.getState();

    expect(design.editingNodeId).toBe(idA);
    expect(design.editingTextBox).toMatchObject({ flipX: true, flipY: true, rotation: 45 });
  });

  it('should carry the path binding back into the editing box when re-editing a path-text node', () => {
    // mock — a 500x500 circle centered at (2850, 2850); pathStartOffset 0.25 puts the content's
    const idA = addPathTextNode(2600, 2600);

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(2850, 3100));

    // result
    const { design } = store.getState();

    expect(design.editingNodeId).toBe(idA);
    expect(design.editingTextBox).toMatchObject({ pathFlip: true, pathId: 'ellipse-1', pathStartOffset: 0.25 });
  });

  it('should start editing an already-selected text node when double-clicked past its rendered content', () => {
    // mock
    const idA = addTextNode(2100, 2100);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action — far from the "Hi" glyphs but still inside the 500x500 fixed box
    canvasRef.current?.dispatchEvent(doubleClickEvent(2400, 2400));

    // result
    expect(store.getState().design.editingNodeId).toBe(idA);
  });

  it('should not start editing when double-clicking empty canvas', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(9000, 9000));

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should not start editing when double-clicking a non-text node', () => {
    // mock
    addFrameNode(2200, 2200);

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(2205, 2205));

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should not react when the active tool is not the default selection tool', () => {
    // mock
    const idA = addTextNode(2300, 2300);

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(2302, 2302));

    // result
    expect(store.getState().design.editingNodeId).toBeNull();
    expect(idA).toBeTruthy();
  });
});
