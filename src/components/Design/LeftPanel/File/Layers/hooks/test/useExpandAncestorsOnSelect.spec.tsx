import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useExpandAncestorsOnSelect } from '../useExpandAncestorsOnSelect';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 10,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.slice(-1)[0];
};

const addRectangle = (): string => {
  store.dispatch(
    addNode({
      fill: '#00ff00',
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.slice(-1)[0];
};

describe('useExpandAncestorsOnSelect', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it("should add the selected node's parent to expandedIds", () => {
    // mock
    const frameId = addFrame();
    const rectangleId = addRectangle();

    store.dispatch(moveNodes({ nodeIds: [rectangleId], targetIndex: 0, targetParentId: frameId }));

    const onExpandedIdsChange = vi.fn();

    // before
    const { rerender } = renderHook(({ expandedIds }) => useExpandAncestorsOnSelect(expandedIds, onExpandedIdsChange), {
      initialProps: { expandedIds: new Set<string>() },
      wrapper,
    });

    // action
    act(() => store.dispatch(setSelection([rectangleId])));
    rerender({ expandedIds: new Set<string>() });

    // result
    expect(onExpandedIdsChange).toHaveBeenCalledWith(new Set([frameId]));
  });

  it('should leave expandedIds untouched when the newly selected node is already at the root', () => {
    // mock
    const rectangleId = addRectangle();
    const onExpandedIdsChange = vi.fn();

    // before
    renderHook(({ expandedIds }) => useExpandAncestorsOnSelect(expandedIds, onExpandedIdsChange), {
      initialProps: { expandedIds: new Set<string>() },
      wrapper,
    });

    // action
    act(() => store.dispatch(setSelection([rectangleId])));

    // result
    expect(onExpandedIdsChange).not.toHaveBeenCalled();
  });

  it("should not call onExpandedIdsChange again when the node's parent is already expanded", () => {
    // mock
    const frameId = addFrame();
    const rectangleId = addRectangle();

    store.dispatch(moveNodes({ nodeIds: [rectangleId], targetIndex: 0, targetParentId: frameId }));

    const onExpandedIdsChange = vi.fn();

    // before
    renderHook(({ expandedIds }) => useExpandAncestorsOnSelect(expandedIds, onExpandedIdsChange), {
      initialProps: { expandedIds: new Set([frameId]) },
      wrapper,
    });

    // action
    act(() => store.dispatch(setSelection([rectangleId])));

    // result
    expect(onExpandedIdsChange).not.toHaveBeenCalled();
  });

  it('should not fire again on a re-render that keeps the same selection', () => {
    // mock
    const frameId = addFrame();
    const rectangleId = addRectangle();

    store.dispatch(moveNodes({ nodeIds: [rectangleId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(setSelection([rectangleId]));

    const onExpandedIdsChange = vi.fn();

    // before
    const { rerender } = renderHook(({ expandedIds }) => useExpandAncestorsOnSelect(expandedIds, onExpandedIdsChange), {
      initialProps: { expandedIds: new Set<string>() },
      wrapper,
    });

    expect(onExpandedIdsChange).toHaveBeenCalledTimes(1);

    // action — a re-render with the same selectedIds (e.g. an unrelated store change)
    rerender({ expandedIds: new Set([frameId]) });

    // result
    expect(onExpandedIdsChange).toHaveBeenCalledTimes(1);
  });

  it("should expand a node's new parent on a live reparent (e.g. dragging it into a Frame) even though the selection itself never changed", () => {
    // mock — the rectangle is already selected, at the root, before it ever gets reparented; this
    // matches updateDragDropTarget.ts dispatching moveNodes live, mid-drag, well before pointerup
    const frameId = addFrame();
    const rectangleId = addRectangle();

    store.dispatch(setSelection([rectangleId]));

    const onExpandedIdsChange = vi.fn();

    renderHook(({ expandedIds }) => useExpandAncestorsOnSelect(expandedIds, onExpandedIdsChange), {
      initialProps: { expandedIds: new Set<string>() },
      wrapper,
    });

    expect(onExpandedIdsChange).not.toHaveBeenCalled();

    // action — the live reparent, selection unchanged
    act(() => store.dispatch(moveNodes({ nodeIds: [rectangleId], targetIndex: 0, targetParentId: frameId })));

    // result
    expect(onExpandedIdsChange).toHaveBeenCalledWith(new Set([frameId]));
  });

  it('should not fire on a plain position update of a selected node — only an actual parent change counts', () => {
    // mock
    const rectangleId = addRectangle();

    store.dispatch(setSelection([rectangleId]));

    const onExpandedIdsChange = vi.fn();

    renderHook(({ expandedIds }) => useExpandAncestorsOnSelect(expandedIds, onExpandedIdsChange), {
      initialProps: { expandedIds: new Set<string>() },
      wrapper,
    });

    // action — dragging a node updates its x/y every pointermove; this must not re-trigger the walk
    act(() => store.dispatch(updateNode({ changes: { x: 50, y: 50 }, id: rectangleId })));

    // result
    expect(onExpandedIdsChange).not.toHaveBeenCalled();
  });
});
