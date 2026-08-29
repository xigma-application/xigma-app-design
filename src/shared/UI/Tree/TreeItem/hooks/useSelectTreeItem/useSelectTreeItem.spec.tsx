import { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectTreeItem } from './useSelectTreeItem';

// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectOrderedNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { setSelectionAnchorId } from './utils/selectionAnchor';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const clickEvent = (modifiers: Partial<Pick<ReactMouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'>> = {}): ReactMouseEvent =>
  ({ ctrlKey: false, metaKey: false, shiftKey: false, ...modifiers }) as ReactMouseEvent;

describe('useSelectTreeItem', () => {
  let idA: string;
  let idB: string;
  let idC: string;
  let idD: string;

  beforeEach(() => {
    [idA, idB, idC, idD] = ['A', 'B', 'C', 'D'].map((name) => {
      store.dispatch(
        addNode({ fill: '#ff0000', height: 10, name, parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
      );

      return selectOrderedNodes(store.getState()).at(-1)!.id;
    });
  });

  afterEach(() => {
    setSelectionAnchorId(null);
    store.dispatch(setSelection([]));
    [idA, idB, idC, idD].forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should select only the clicked id on a plain click', () => {
    // before
    store.dispatch(setSelection([idA]));
    const { result } = renderHook(() => useSelectTreeItem(idB), { wrapper });

    // action
    result.current(clickEvent());

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idB]);
  });

  it('should add the clicked id to the selection on a ctrl-click', () => {
    // before
    store.dispatch(setSelection([idA]));
    const { result } = renderHook(() => useSelectTreeItem(idB), { wrapper });

    // action
    result.current(clickEvent({ ctrlKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);
  });

  it('should support the meta key as an alias for ctrl on a toggle-click', () => {
    // before
    const { result } = renderHook(() => useSelectTreeItem(idA), { wrapper });

    // action
    result.current(clickEvent({ metaKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
  });

  it('should remove an already-selected id from the selection on a ctrl-click', () => {
    // before
    store.dispatch(setSelection([idA, idB]));
    const { result } = renderHook(() => useSelectTreeItem(idB), { wrapper });

    // action
    result.current(clickEvent({ ctrlKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
  });

  it('should select the contiguous range between the anchor and the shift-clicked id', () => {
    // before
    const { rerender, result } = renderHook(({ id }) => useSelectTreeItem(id), { initialProps: { id: idA }, wrapper });
    result.current(clickEvent());
    rerender({ id: idC });

    // action
    result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB, idC]);
  });

  it('should select the range in list order even when shift-clicking upward, above the anchor', () => {
    // before
    const { rerender, result } = renderHook(({ id }) => useSelectTreeItem(id), { initialProps: { id: idC }, wrapper });
    result.current(clickEvent());
    rerender({ id: idA });

    // action
    result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB, idC]);
  });

  it('should fall back to selecting just the clicked id on a shift-click with no prior anchor', () => {
    // before
    const { result } = renderHook(() => useSelectTreeItem(idB), { wrapper });

    // action
    result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idB]);
  });

  it('should keep ranging from the original anchor across multiple consecutive shift-clicks', () => {
    // before
    const { rerender, result } = renderHook(({ id }) => useSelectTreeItem(id), { initialProps: { id: idA }, wrapper });
    result.current(clickEvent());

    // action — first shift-click extends A..C
    rerender({ id: idC });
    result.current(clickEvent({ shiftKey: true }));
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB, idC]);

    // action — a second shift-click still ranges from the original anchor A, not from C
    rerender({ id: idB });
    result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);
  });

  it('should move the anchor to the ctrl-clicked id, so a later shift-click ranges from there', () => {
    // before
    const { rerender, result } = renderHook(({ id }) => useSelectTreeItem(id), { initialProps: { id: idA }, wrapper });
    result.current(clickEvent());
    rerender({ id: idB });
    result.current(clickEvent({ ctrlKey: true }));

    // action
    rerender({ id: idD });
    result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idB, idC, idD]);
  });
});
