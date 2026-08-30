import { Provider } from 'react-redux';
import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import LayersTree from './LayersTree';

// store
import { addNode, deleteNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

const renderLayersTree = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <LayersTree />
    </Provider>,
  );

describe('LayersTree', () => {
  let idA: string;
  let idB: string;

  beforeEach(() => {
    stubVirtualizerViewport(5000);
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
  });

  afterEach(() => {
    store.dispatch(deleteNode(idA));
    store.dispatch(deleteNode(idB));
    store.dispatch(setSelection([]));
    vi.restoreAllMocks();
  });

  it('should render one row per node in the active page', () => {
    // before
    renderLayersTree();

    // result
    expect(screen.getByText('Frame A')).toBeInTheDocument();
    expect(screen.getByText('Frame B')).toBeInTheDocument();
  });

  it('should reorder the active page rootOrder when a row is dragged past another', () => {
    // before
    renderLayersTree();
    const rowA = screen.getByText('Frame A').closest('[class*="Tree__row"]')!;
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    const indexA = rootOrderBefore.indexOf(idA);

    // action — drag row A down past row B
    fireEvent.mouseDown(rowA, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 100 });
    fireEvent.mouseUp(document);

    // result
    expect(selectActivePage(store.getState()).rootOrder.indexOf(idA)).not.toBe(indexA);
  });

  it('should render the dot-and-line drop indicator, not the default plain-line one, while dragging', () => {
    // before
    renderLayersTree();
    const rowA = screen.getByText('Frame A').closest('[class*="Tree__row"]')!;

    // action
    fireEvent.mouseDown(rowA, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 100 });

    // result
    expect(document.querySelector('[class*="LayersTreeDropIndicator"]')).toBeInTheDocument();
    expect(document.querySelector('[class*="Tree__dropIndicator--default"]')).not.toBeInTheDocument();

    // after
    fireEvent.mouseUp(document);
  });

  it('should drag every row in the current multi-selection together, preserving their relative order', () => {
    // mock — a third node so there is something to drag the [A,B] selection past
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame C', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    const [idC] = selectActivePage(store.getState()).rootOrder.slice(-1);
    act(() => store.dispatch(setSelection([idA, idB])));

    renderLayersTree();
    const rowA = screen.getByText('Frame A').closest('[class*="Tree__row"]')!;

    // action — drag row A, part of the [A,B] selection, far down past every other row
    fireEvent.mouseDown(rowA, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 100000 });
    fireEvent.mouseUp(document);

    // result — A and B land together at the end, in their original relative order
    expect(selectActivePage(store.getState()).rootOrder.slice(-2)).toEqual([idA, idB]);

    // after
    store.dispatch(deleteNode(idC));
  });

  it('should drag only the clicked row when it is not part of the current multi-selection', () => {
    // mock
    act(() => store.dispatch(setSelection([idA])));
    renderLayersTree();
    const rowB = screen.getByText('Frame B').closest('[class*="Tree__row"]')!;
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    const indexA = rootOrderBefore.indexOf(idA);

    // action — drag the unselected row B
    fireEvent.mouseDown(rowB, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 100000 });
    fireEvent.mouseUp(document);

    // result — A never moved, only B did
    expect(selectActivePage(store.getState()).rootOrder.indexOf(idA)).toBe(indexA);
  });

  it('should render one merged selection background spanning both rows when two adjacent rows are selected', () => {
    // before
    act(() => store.dispatch(setSelection([idA, idB])));
    const { container } = renderLayersTree();

    // result — a single background element covers both rows, not one per row
    const mergedSegments = container.querySelectorAll('[class*="Tree__selectionBackground"]');
    expect(mergedSegments).toHaveLength(1);
    const mergedHeight = Number((mergedSegments[0] as HTMLElement).style.height.replace('px', ''));

    // action — deselect one row, leaving only a single selected row
    act(() => store.dispatch(setSelection([idB])));

    // result — the background shrinks to a single row's own height
    const singleSegments = container.querySelectorAll('[class*="Tree__selectionBackground"]');
    expect(singleSegments).toHaveLength(1);
    const singleHeight = Number((singleSegments[0] as HTMLElement).style.height.replace('px', ''));
    expect(singleHeight).toBeLessThan(mergedHeight);
  });

  describe('nested groups', () => {
    it('should show an expand toggle for a group row but not for a leaf row', () => {
      // mock
      act(() => store.dispatch(setSelection([idA, idB])));
      store.dispatch(groupNodes());
      store.dispatch(
        addNode({ fill: '#ff0000', height: 10, name: 'Frame C', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
      );
      const [idC] = selectActivePage(store.getState()).rootOrder.slice(-1);

      // before
      renderLayersTree();

      // result — one toggle for the group, none for the leaf row, children not yet visible
      expect(screen.getByRole('button', { name: 'Expand layer' })).toBeInTheDocument();
      expect(screen.queryByText('Frame A')).not.toBeInTheDocument();
      expect(screen.queryByText('Frame B')).not.toBeInTheDocument();

      // after
      store.dispatch(deleteNode(idC));
    });

    it('should reveal the group children as indented rows once expanded, and hide them again on a second click', () => {
      // mock
      act(() => store.dispatch(setSelection([idA, idB])));
      store.dispatch(groupNodes());

      // before
      renderLayersTree();

      // action
      fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));

      // result
      expect(screen.getByText('Frame A')).toBeInTheDocument();
      expect(screen.getByText('Frame B')).toBeInTheDocument();

      // action
      fireEvent.click(screen.getByRole('button', { name: 'Collapse layer' }));

      // result
      expect(screen.queryByText('Frame A')).not.toBeInTheDocument();
      expect(screen.queryByText('Frame B')).not.toBeInTheDocument();
    });

    it('should map a drag onto the correct rootOrder slot even while a group is expanded and its children are among the visible rows', () => {
      // mock
      act(() => store.dispatch(setSelection([idA, idB])));
      store.dispatch(groupNodes());
      const [groupId] = selectActivePage(store.getState()).selectedIds;
      store.dispatch(
        addNode({ fill: '#ff0000', height: 10, name: 'Frame C', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
      );
      const [idC] = selectActivePage(store.getState()).rootOrder.slice(-1);

      renderLayersTree();
      fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));
      const rowC = screen.getByText('Frame C').closest('[class*="Tree__row"]')!;

      // action — drag the top-level row C (visible below the group's two expanded children) up above the group
      fireEvent.mouseDown(rowC, { button: 0, clientY: 0 });
      fireEvent.mouseMove(document, { clientY: -100000 });
      fireEvent.mouseUp(document);

      // result — rootOrder reflects C moving before the group, unaffected by the nested rows in between
      expect(selectActivePage(store.getState()).rootOrder).toEqual([idC, groupId]);

      // after
      store.dispatch(deleteNode(idC));
    });

    it('should move a nested child out of its group and back to the top level when dragged past every row', () => {
      // mock
      act(() => store.dispatch(setSelection([idA, idB])));
      store.dispatch(groupNodes());
      const [groupId] = selectActivePage(store.getState()).selectedIds;

      renderLayersTree();
      fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));
      const rowA = screen.getByText('Frame A').closest('[class*="Tree__row"]')!;

      // action — drag the nested child row 'Frame A' far down, past every other row, landing at depth 0
      fireEvent.mouseDown(rowA, { button: 0, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 0, clientY: 100000 });
      fireEvent.mouseUp(document);

      // result — A is now a top-level node, no longer inside the group
      const page = selectActivePage(store.getState());
      expect(page.rootOrder).toContain(idA);
      expect(page.nodes[idA].parentId).toBeNull();
      expect((page.nodes[groupId] as { childIds: string[] }).childIds).not.toContain(idA);
    });

    it('should delete the group once its last remaining child is dragged out, leaving nothing behind', () => {
      // mock
      act(() => store.dispatch(setSelection([idA, idB])));
      store.dispatch(groupNodes());
      const [groupId] = selectActivePage(store.getState()).selectedIds;
      act(() => store.dispatch(setSelection([idA, idB])));

      renderLayersTree();
      fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));
      const rowA = screen.getByText('Frame A').closest('[class*="Tree__row"]')!;

      // action — drag the whole [A, B] multi-selection (the group's only children) out to the top level
      fireEvent.mouseDown(rowA, { button: 0, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 0, clientY: 100000 });
      fireEvent.mouseUp(document);

      // result — the now-empty group is gone entirely
      const page = selectActivePage(store.getState());
      expect(page.nodes[groupId]).toBeUndefined();
      expect(page.rootOrder).not.toContain(groupId);
      expect(page.rootOrder).toContain(idA);
      expect(page.rootOrder).toContain(idB);
    });

    it('should reparent a top-level node into a group when dropped at the group depth', () => {
      // mock
      act(() => store.dispatch(setSelection([idA, idB])));
      store.dispatch(groupNodes());
      const [groupId] = selectActivePage(store.getState()).selectedIds;
      store.dispatch(
        addNode({ fill: '#ff0000', height: 10, name: 'Frame C', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
      );
      const [idC] = selectActivePage(store.getState()).rootOrder.slice(-1);

      renderLayersTree();
      fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));
      const rowC = screen.getByText('Frame C').closest('[class*="Tree__row"]')!;

      // action — drag row C ('group', 'A', 'B', 'C' visible in that order) up onto the group's first child slot,
      // shifted right by one indent level so it resolves to depth 1 (a child of the group)
      fireEvent.mouseDown(rowC, { button: 0, clientX: 0, clientY: 96 });
      fireEvent.mouseMove(document, { clientX: 16, clientY: 32 });
      fireEvent.mouseUp(document);

      // result — C is now a child of the group instead of a top-level node
      const page = selectActivePage(store.getState());
      expect(page.nodes[idC].parentId).toBe(groupId);
      expect((page.nodes[groupId] as { childIds: string[] }).childIds).toContain(idC);

      // after — C is now nested inside the group, so the outer afterEach (which only knows idA/idB) can't
      // reach it; delete it directly so it doesn't leak into later tests
      store.dispatch(deleteNode(idC));
    });

    it('should no-op when the multi-selection being dragged spans rows with different parents', () => {
      // mock — 'A' ends up nested inside the group while 'C' stays top-level, so selecting both together
      // is a multi-drag across two different parents, which is not a supported move
      act(() => store.dispatch(setSelection([idA, idB])));
      store.dispatch(groupNodes());
      const [groupId] = selectActivePage(store.getState()).selectedIds;
      store.dispatch(
        addNode({ fill: '#ff0000', height: 10, name: 'Frame C', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
      );
      const [idC] = selectActivePage(store.getState()).rootOrder.slice(-1);
      act(() => store.dispatch(setSelection([idA, idC])));

      renderLayersTree();
      fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));
      const rowA = screen.getByText('Frame A').closest('[class*="Tree__row"]')!;

      // action
      fireEvent.mouseDown(rowA, { button: 0, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 0, clientY: 100000 });
      fireEvent.mouseUp(document);

      // result — nothing moved
      const page = selectActivePage(store.getState());
      expect(page.nodes[idA].parentId).toBe(groupId);
      expect((page.nodes[groupId] as { childIds: string[] }).childIds).toContain(idA);

      // after
      store.dispatch(deleteNode(idC));
    });
  });
});
