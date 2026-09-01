import { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor } from '@testing-library/react';

// hooks
import { useCanvasContextMenu } from './useCanvasContextMenu';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';

const buildContextMenuEvent = (clientX: number, clientY: number): ReactMouseEvent<HTMLElement> =>
  ({
    button: 2,
    clientX,
    clientY,
    nativeEvent: { clientX, clientY } as MouseEvent,
    preventDefault: vi.fn(),
  }) as unknown as ReactMouseEvent<HTMLElement>;

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useCanvasContextMenu', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
    store.dispatch(setSelection([]));
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
