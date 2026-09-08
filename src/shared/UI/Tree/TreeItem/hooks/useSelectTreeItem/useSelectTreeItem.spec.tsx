import { FC, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectTreeItem } from './useSelectTreeItem';

// others
import { TreeVisibleOrderContext } from 'shared/UI/Tree/hooks/useTreeVisibleOrder/context';

// store
import { addNode, deleteNode, moveNodes, setSelection } from 'store/design/slice';
import { selectOrderedNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { setSelectionAnchorId } from './utils/selectionAnchor';

const createWrapper = (visibleOrderIds: string[]): FC<{ children: ReactNode }> =>
  function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return (
      <Provider store={store}>
        <TreeVisibleOrderContext.Provider value={visibleOrderIds}>{children}</TreeVisibleOrderContext.Provider>
      </Provider>
    );
  };

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
        addNode({
          childIds: [],
          clipContent: true,
          fill: '#ff0000',
          height: 10,
          name,
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width: 10,
          x: 0,
          y: 0,
        }),
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
    const { result } = renderHook(() => useSelectTreeItem(idB), { wrapper: createWrapper([idA, idB, idC, idD]) });

    // action
    result.current(clickEvent());

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idB]);
  });

  it('should add the clicked id to the selection on a ctrl-click', () => {
    // before
    store.dispatch(setSelection([idA]));
    const { result } = renderHook(() => useSelectTreeItem(idB), { wrapper: createWrapper([idA, idB, idC, idD]) });

    // action
    result.current(clickEvent({ ctrlKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB]);
  });

  it('should support the meta key as an alias for ctrl on a toggle-click', () => {
    // before
    const { result } = renderHook(() => useSelectTreeItem(idA), { wrapper: createWrapper([idA, idB, idC, idD]) });

    // action
    result.current(clickEvent({ metaKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
  });

  it('should remove an already-selected id from the selection on a ctrl-click', () => {
    // before
    store.dispatch(setSelection([idA, idB]));
    const { result } = renderHook(() => useSelectTreeItem(idB), { wrapper: createWrapper([idA, idB, idC, idD]) });

    // action
    result.current(clickEvent({ ctrlKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
  });

  it('should select the contiguous range between the anchor and the shift-clicked id', () => {
    // before
    const { rerender, result } = renderHook(({ id }) => useSelectTreeItem(id), {
      initialProps: { id: idA },
      wrapper: createWrapper([idA, idB, idC, idD]),
    });
    result.current(clickEvent());
    rerender({ id: idC });

    // action
    result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB, idC]);
  });

  it('should select the range in list order even when shift-clicking upward, above the anchor', () => {
    // before
    const { rerender, result } = renderHook(({ id }) => useSelectTreeItem(id), {
      initialProps: { id: idC },
      wrapper: createWrapper([idA, idB, idC, idD]),
    });
    result.current(clickEvent());
    rerender({ id: idA });

    // action
    result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA, idB, idC]);
  });

  it('should fall back to selecting just the clicked id on a shift-click with no prior anchor', () => {
    // before
    const { result } = renderHook(() => useSelectTreeItem(idB), { wrapper: createWrapper([idA, idB, idC, idD]) });

    // action
    result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idB]);
  });

  it('should keep ranging from the original anchor across multiple consecutive shift-clicks', () => {
    // before
    const { rerender, result } = renderHook(({ id }) => useSelectTreeItem(id), {
      initialProps: { id: idA },
      wrapper: createWrapper([idA, idB, idC, idD]),
    });
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
    const { rerender, result } = renderHook(({ id }) => useSelectTreeItem(id), {
      initialProps: { id: idA },
      wrapper: createWrapper([idA, idB, idC, idD]),
    });
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

describe('useSelectTreeItem — nested rows', () => {
  let frameId: string;
  let childBId: string;
  let childCId: string;
  let siblingFrameId: string;

  const addNamedFrame = (name: string): string => {
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 10,
        name,
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    return selectOrderedNodes(store.getState()).at(-1)!.id;
  };

  const addNamedRectangle = (name: string): string => {
    store.dispatch(
      addNode({ fill: '#00ff00', height: 5, name, parentId: null, rotation: 0, type: NodeType.rectangle, width: 5, x: 0, y: 0 }),
    );

    return selectOrderedNodes(store.getState()).at(-1)!.id;
  };

  beforeEach(() => {
    // Frame > [childB, childC], then a sibling Frame2 — matching a real Layers tree where an
    // expanded frame's children never appear in the page's own top-level rootOrder
    frameId = addNamedFrame('Frame');
    childBId = addNamedRectangle('B');
    childCId = addNamedRectangle('C');
    siblingFrameId = addNamedFrame('Frame2');

    store.dispatch(moveNodes({ nodeIds: [childBId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [childCId], targetIndex: 1, targetParentId: frameId }));
  });

  afterEach(() => {
    setSelectionAnchorId(null);
    store.dispatch(setSelection([]));
    [frameId, childBId, childCId, siblingFrameId].forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should confirm the nested children are absent from rootOrder, reproducing the bug scenario', () => {
    expect(selectOrderedNodes(store.getState()).map((node) => node.id)).toEqual([frameId, siblingFrameId]);
  });

  it('should select every visible row between two nested siblings under the same expanded parent', () => {
    // mock — the visible tree order, as Tree.tsx would actually flatten it once Frame is expanded;
    // a separate renderHook instance per row, matching how each TreeItem row is its own component
    const wrapper = createWrapper([frameId, childBId, childCId, siblingFrameId]);
    const anchorRow = renderHook(() => useSelectTreeItem(childBId), { wrapper });
    const targetRow = renderHook(() => useSelectTreeItem(childCId), { wrapper });

    anchorRow.result.current(clickEvent());

    // action
    targetRow.result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([childBId, childCId]);
  });

  it('should select every visible row when shift-clicking from a nested anchor up to a shallower sibling frame', () => {
    // mock
    const wrapper = createWrapper([frameId, childBId, childCId, siblingFrameId]);
    const anchorRow = renderHook(() => useSelectTreeItem(childBId), { wrapper });
    const targetRow = renderHook(() => useSelectTreeItem(siblingFrameId), { wrapper });

    anchorRow.result.current(clickEvent());

    // action — shift-click a shallower (top-level) target after a nested anchor
    targetRow.result.current(clickEvent({ shiftKey: true }));

    // result — spans the nested sibling and the shallower frame, not just the clicked target
    expect(selectSelectedIds(store.getState())).toEqual([childBId, childCId, siblingFrameId]);
  });

  it('should select every visible row when shift-clicking from a shallower anchor down into a nested target, ancestor absorbing its own descendants', () => {
    // mock — the reverse direction: anchor at the top level, target nested two rows down. The
    // computed range itself is [frame, childB, childC] (proving the range spans the depth change
    // correctly), but frame is childB/childC's own parent, so the pre-existing, unrelated
    // dropDescendantsOfSelected normalization (handleSetSelection.ts) then collapses the range
    // down to just the ancestor — selecting a frame already implies its children, same as it
    // would for a plain click on the frame alone.
    const wrapper = createWrapper([frameId, childBId, childCId, siblingFrameId]);
    const anchorRow = renderHook(() => useSelectTreeItem(frameId), { wrapper });
    const targetRow = renderHook(() => useSelectTreeItem(childCId), { wrapper });

    anchorRow.result.current(clickEvent());

    // action
    targetRow.result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([frameId]);
  });

  it('should select every visible row when shift-clicking from a shallower anchor up into an unrelated nested target', () => {
    // mock — anchor is the shallow sibling frame (not an ancestor of the target, so nothing gets
    // collapsed by dropDescendantsOfSelected), target is nested two rows earlier in visible order
    const wrapper = createWrapper([frameId, childBId, childCId, siblingFrameId]);
    const anchorRow = renderHook(() => useSelectTreeItem(siblingFrameId), { wrapper });
    const targetRow = renderHook(() => useSelectTreeItem(childCId), { wrapper });

    anchorRow.result.current(clickEvent());

    // action
    targetRow.result.current(clickEvent({ shiftKey: true }));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([childCId, siblingFrameId]);
  });
});
