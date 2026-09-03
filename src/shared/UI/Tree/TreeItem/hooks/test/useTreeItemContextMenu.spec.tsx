import { MouseEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useTreeItemContextMenu } from '../useTreeItemContextMenu';

// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectOrderedNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { setSelectionAnchorId } from '../useSelectTreeItem/utils/selectionAnchor';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const contextMenuEvent = (x: number, y: number): MouseEvent =>
  ({ clientX: x, clientY: y, preventDefault: vi.fn() }) as unknown as MouseEvent;

describe('useTreeItemContextMenu', () => {
  let idA: string;
  let idB: string;

  beforeEach(() => {
    vi.useFakeTimers();

    [idA, idB] = ['A', 'B'].map((name) => {
      store.dispatch(
        addNode({ fill: '#ff0000', height: 10, name, parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
      );

      return selectOrderedNodes(store.getState()).at(-1)!.id;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    setSelectionAnchorId(null);
    store.dispatch(setSelection([]));
    [idA, idB].forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should start closed with a zeroed anchor rect', () => {
    // before
    const { result } = renderHook(() => useTreeItemContextMenu(idA), { wrapper });

    // result
    const rect = result.current.anchorRef.current.getBoundingClientRect();

    expect(result.current.isOpen).toBe(false);
    expect([rect.x, rect.y]).toEqual([0, 0]);
  });

  it('should anchor at the cursor position and block the native menu immediately, but only open on the next tick', () => {
    // mock
    const event = contextMenuEvent(120, 240);

    // before
    const { result } = renderHook(() => useTreeItemContextMenu(idA), { wrapper });

    // result — closed initially
    expect(result.current.isOpen).toBe(false);

    // action
    act(() => result.current.onContextMenu(event));

    // result — anchored and prevented synchronously, but not yet open: opening this same tick would
    // race radix's own outside-interaction detection against the tail of this right-click gesture
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);

    const rect = result.current.anchorRef.current.getBoundingClientRect();

    expect([rect.x, rect.y]).toEqual([120, 240]);

    // action
    act(() => vi.runAllTimers());

    // result
    expect(result.current.isOpen).toBe(true);
  });

  it('should close through onOpenChange', () => {
    // before
    const { result } = renderHook(() => useTreeItemContextMenu(idA), { wrapper });
    act(() => result.current.onContextMenu(contextMenuEvent(0, 0)));
    act(() => vi.runAllTimers());

    // action
    act(() => result.current.onOpenChange(false));

    // result
    expect(result.current.isOpen).toBe(false);
  });

  it('should select the right-clicked row when it is not already selected', () => {
    // before
    store.dispatch(setSelection([idA]));
    const { result } = renderHook(() => useTreeItemContextMenu(idB), { wrapper });

    // action
    act(() => result.current.onContextMenu(contextMenuEvent(0, 0)));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idB]);
  });

  it('should keep an existing multi-selection intact when right-clicking a row already part of it', () => {
    // before
    store.dispatch(setSelection([idA, idB]));
    const { result } = renderHook(() => useTreeItemContextMenu(idB), { wrapper });

    // action
    act(() => result.current.onContextMenu(contextMenuEvent(0, 0)));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);
  });
});
