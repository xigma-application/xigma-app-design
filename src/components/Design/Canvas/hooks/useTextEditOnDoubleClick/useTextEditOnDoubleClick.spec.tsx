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

const addTextNode = (x: number, y: number, content = 'Hi', size = 500): string => {
  store.dispatch(
    addNode({
      content,
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
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
    expect(design.editingTextBox).toEqual({ height: 500, width: 500, x: 2000, y: 2000 });
    expect(design.editingTextContent).toBe('Hi');
    expect(design.selectedIds).toEqual([idA]);
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
