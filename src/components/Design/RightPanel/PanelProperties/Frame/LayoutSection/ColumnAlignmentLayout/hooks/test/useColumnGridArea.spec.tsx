import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useColumnGridArea } from '../useColumnGridArea';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnGridArea = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnGridArea>, unknown>> =>
  renderHook(() => useColumnGridArea(), { wrapper });

const addGridFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addChild = (parentId: string): void => {
  store.dispatch(
    addNode({ fill: '#000', height: 10, name: 'Rect', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { nodes, rootOrder } = selectActivePage(store.getState());
  const childId = rootOrder.filter((id) => nodes[id].type === NodeType.rectangle).at(-1) as string;

  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
};

const readFrame = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('useColumnGridArea', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to a single column and row when nothing is selected', () => {
    const { result } = renderUseColumnGridArea();

    expect(result.current.columns).toBe('1');
    expect(result.current.rows).toBe('1');
  });

  it('should do nothing when a matrix cell is clicked with nothing selected', () => {
    const { result } = renderUseColumnGridArea();

    expect(() => act(() => result.current.onClickCell({ columns: 2, rows: 2 }))).not.toThrow();
  });

  it('should read the frame’s column count and derive the effective row count from its children', () => {
    const frameId = addGridFrame();

    store.dispatch(updateNode({ changes: { gridColumnCount: 3 }, id: frameId }));
    addChild(frameId);
    addChild(frameId);
    addChild(frameId);
    addChild(frameId);
    addChild(frameId);
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    expect(result.current.columns).toBe('3');
    expect(result.current.rows).toBe('2');
  });

  it('should prefer an explicit row count over the derived one', () => {
    const frameId = addGridFrame();

    store.dispatch(updateNode({ changes: { gridColumnCount: 3, gridRowCount: 4 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    expect(result.current.rows).toBe('4');
  });

  it('should commit a valid column count', () => {
    const frameId = addGridFrame();

    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitColumns('6'));

    expect(readFrame(frameId).gridColumnCount).toBe(6);
  });

  it('should ignore an out-of-range or empty count', () => {
    const frameId = addGridFrame();

    store.dispatch(updateNode({ changes: { gridColumnCount: 2, gridRowCount: 2 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitColumns('999'));
    act(() => result.current.onCommitRows(''));

    expect(readFrame(frameId)).toMatchObject({ gridColumnCount: 2, gridRowCount: 2 });
  });

  it('should commit a valid row count', () => {
    const frameId = addGridFrame();

    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitRows('5'));

    expect(readFrame(frameId).gridRowCount).toBe(5);
  });

  it('should commit both dimensions at once when a matrix cell is clicked', () => {
    const frameId = addGridFrame();

    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onClickCell({ columns: 4, rows: 3 }));

    expect(readFrame(frameId)).toMatchObject({ gridColumnCount: 4, gridRowCount: 3 });
  });

  it('should reject a column commit whose capacity is too small for the fixed row count and the current children', () => {
    const frameId = addGridFrame();

    for (let i = 0; i < 6; i += 1) {
      addChild(frameId);
    }

    store.dispatch(updateNode({ changes: { gridColumnCount: 2, gridRowCount: 4 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitColumns('1'));

    // 1 column x 4 fixed rows = 4 cells, short of the 6 children — rejected, nothing changes
    expect(readFrame(frameId)).toMatchObject({ gridColumnCount: 2, gridRowCount: 4 });
  });

  it('should allow a column commit that would be too small for the fixed row count when rows are Auto', () => {
    const frameId = addGridFrame();

    for (let i = 0; i < 6; i += 1) {
      addChild(frameId);
    }

    store.dispatch(updateNode({ changes: { gridColumnCount: 2 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitColumns('1'));

    expect(readFrame(frameId).gridColumnCount).toBe(1);
  });

  it('should reject a row commit whose capacity is too small for the current children', () => {
    const frameId = addGridFrame();

    for (let i = 0; i < 6; i += 1) {
      addChild(frameId);
    }

    store.dispatch(updateNode({ changes: { gridColumnCount: 2, gridRowCount: 4 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitRows('1'));

    // 2 columns x 1 row = 2 cells, short of the 6 children — rejected
    expect(readFrame(frameId)).toMatchObject({ gridColumnCount: 2, gridRowCount: 4 });
  });

  it('should reject a matrix-cell click whose capacity is too small for the current children', () => {
    const frameId = addGridFrame();

    for (let i = 0; i < 6; i += 1) {
      addChild(frameId);
    }

    store.dispatch(updateNode({ changes: { gridColumnCount: 2, gridRowCount: 4 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onClickCell({ columns: 1, rows: 1 }));

    expect(readFrame(frameId)).toMatchObject({ gridColumnCount: 2, gridRowCount: 4 });
  });

  it('should repack a manually anchored child that no longer fits when the columns shrink', () => {
    const frameId = addGridFrame();

    addChild(frameId);
    addChild(frameId);

    const [firstId, secondId] = readFrame(frameId).childIds;

    store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0 }, id: firstId }));
    store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0 }, id: secondId }));
    store.dispatch(updateNode({ changes: { gridAutoPlacement: false, gridColumnCount: 2 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitColumns('1'));

    const page = selectActivePage(store.getState());

    // the first child keeps its cell; the second no longer fits at column 1 and drops into row 1
    expect(page.nodes[firstId]).toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0 });
    expect(page.nodes[secondId]).toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 });
  });

  it('should reset every spanning child back to 1x1 when the columns are committed', () => {
    const frameId = addGridFrame();

    addChild(frameId);
    addChild(frameId);

    const [firstId, secondId] = readFrame(frameId).childIds;

    store.dispatch(updateNode({ changes: { gridColumnSpan: 2, gridRowSpan: 2 }, id: firstId }));
    store.dispatch(updateNode({ changes: { gridColumnCount: 4 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitColumns('3'));

    const page = selectActivePage(store.getState());

    expect(readFrame(frameId).gridColumnCount).toBe(3);
    expect(page.nodes[firstId]).toMatchObject({ gridColumnSpan: undefined, gridRowSpan: undefined });
    expect((page.nodes[secondId] as { gridColumnSpan?: number }).gridColumnSpan).toBeUndefined();
  });

  it('should reset a spanning child back to 1x1 when a matrix cell is clicked', () => {
    const frameId = addGridFrame();

    addChild(frameId);

    const [childId] = readFrame(frameId).childIds;

    store.dispatch(updateNode({ changes: { gridColumnSpan: 3, gridRowSpan: 1 }, id: childId }));
    store.dispatch(updateNode({ changes: { gridColumnCount: 3 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onClickCell({ columns: 2, rows: 2 }));

    expect(selectActivePage(store.getState()).nodes[childId]).toMatchObject({
      gridColumnSpan: undefined,
      gridRowSpan: undefined,
    });
  });

  it('should not touch child spans when the resize is rejected', () => {
    const frameId = addGridFrame();

    for (let i = 0; i < 4; i += 1) {
      addChild(frameId);
    }

    const [firstId] = readFrame(frameId).childIds;

    store.dispatch(updateNode({ changes: { gridColumnSpan: 2, gridRowSpan: 2 }, id: firstId }));
    store.dispatch(updateNode({ changes: { gridColumnCount: 2, gridRowCount: 2 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    act(() => result.current.onCommitColumns('1'));

    // 1 column x 2 fixed rows = 2 cells, short of the 4 children — rejected, spans untouched
    expect(selectActivePage(store.getState()).nodes[firstId]).toMatchObject({ gridColumnSpan: 2, gridRowSpan: 2 });
  });

  it('should report the rows as auto until an explicit count is set', () => {
    const frameId = addGridFrame();

    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    expect(result.current.isRowsAuto).toBe(true);

    act(() => result.current.onSetRowsFixed());

    expect(result.current.isRowsAuto).toBe(false);
    expect(readFrame(frameId).gridRowCount).toBe(result.current.rows.length ? Number(result.current.rows) : 1);
  });

  it('should clear the explicit row count when switched back to auto', () => {
    const frameId = addGridFrame();

    store.dispatch(updateNode({ changes: { gridRowCount: 4 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnGridArea();

    expect(result.current.isRowsAuto).toBe(false);

    act(() => result.current.onSetRowsAuto());

    expect(result.current.isRowsAuto).toBe(true);
    expect(readFrame(frameId).gridRowCount).toBeUndefined();
  });
});
