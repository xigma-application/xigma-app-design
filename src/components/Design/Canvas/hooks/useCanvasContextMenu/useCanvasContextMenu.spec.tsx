import { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor } from '@testing-library/react';

// hooks
import { useCanvasContextMenu } from './useCanvasContextMenu';

// store
import { addNode, deleteNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';

const buildContextMenuEvent = (clientX: number, clientY: number, shiftKey = false): ReactMouseEvent<HTMLElement> =>
  ({
    button: 2,
    clientX,
    clientY,
    nativeEvent: { clientX, clientY } as MouseEvent,
    preventDefault: vi.fn(),
    shiftKey,
  }) as unknown as ReactMouseEvent<HTMLElement>;

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useCanvasContextMenu', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should select the hit node and expose it as hitNode when right-clicking on top of it', async () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const [nodeId] = rootOrder;
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // before
    const { result } = renderHook(() => useCanvasContextMenu(refs), { wrapper });

    // action — right-click squarely inside the 0,0-20,20 rectangle
    result.current.onContextMenu(buildContextMenuEvent(10, 10));

    // result
    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(result.current.hitNode?.id).toBe(nodeId);
    expect(selectSelectedIds(store.getState())).toEqual([nodeId]);
  });

  it('should not touch the selection when the hit node is already selected', async () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const [nodeId] = rootOrder;
    store.dispatch(setSelection([nodeId]));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // before
    const { result } = renderHook(() => useCanvasContextMenu(refs), { wrapper });

    // action
    result.current.onContextMenu(buildContextMenuEvent(10, 10));

    // result
    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(selectSelectedIds(store.getState())).toEqual([nodeId]);
  });

  it('should leave hitNode null and the selection untouched when right-clicking empty canvas', async () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // before
    const { result } = renderHook(() => useCanvasContextMenu(refs), { wrapper });

    // action
    result.current.onContextMenu(buildContextMenuEvent(500, 500));

    // result
    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(result.current.hitNode).toBeNull();
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it("should leave selection and hitNode untouched, and never open, for a Shift-held contextmenu event — macOS's own Ctrl+click-as-right-click alias for the Ctrl+Shift+click group-child toggle shortcut", () => {
    // mock — a group child that isn't in the current selection yet
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // before
    const { result } = renderHook(() => useCanvasContextMenu(refs), { wrapper });

    // action
    result.current.onContextMenu(buildContextMenuEvent(10, 10, true));

    // result — no selection clobbered, no menu opened to swallow the click that actually toggled it
    expect(result.current.isOpen).toBe(false);
    expect(result.current.hitNode).toBeNull();
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it("should leave selection and hitNode untouched, and never open, while a vector node is open for editing — macOS's own Ctrl+click-as-right-click alias for every Vector Edit Mode Ctrl+click gesture (arming a bend, pulling a handle, ...)", () => {
    // mock — a node sitting under the click point, which a real right-click would otherwise hit
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    store.dispatch(setVectorEditingNodeIds(['some-vector-node']));
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    // before
    const { result } = renderHook(() => useCanvasContextMenu(refs), { wrapper });

    // action — a plain (no Shift) Ctrl+click, which macOS also delivers as this contextmenu event
    result.current.onContextMenu(buildContextMenuEvent(10, 10));

    // result
    expect(result.current.isOpen).toBe(false);
    expect(result.current.hitNode).toBeNull();
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should do nothing when the canvas element ref is not mounted yet', () => {
    // mock
    const refs = createCanvasRefs({ canvasRef: { current: null } });

    // before
    const { result } = renderHook(() => useCanvasContextMenu(refs), { wrapper });

    // action
    result.current.onContextMenu(buildContextMenuEvent(10, 10));

    // result
    expect(result.current.isOpen).toBe(false);
    expect(result.current.hitNode).toBeNull();
  });
});
