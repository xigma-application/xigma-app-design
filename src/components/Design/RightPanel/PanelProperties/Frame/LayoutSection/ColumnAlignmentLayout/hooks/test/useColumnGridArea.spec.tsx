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
