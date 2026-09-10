import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnGridChildSpan } from '../useColumnGridChildSpan';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnGridChildSpan = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnGridChildSpan>, unknown>> =>
  renderHook(() => useColumnGridChildSpan(), { wrapper });

const addFrame = (layoutMode?: LayoutMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 200,
      layoutMode,
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

const addRectangle = (): string => {
  store.dispatch(
    addNode({
      fill: '#00ff00',
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

  return rootOrder[rootOrder.length - 1];
};

const moveIntoParent = (childId: string, parentId: string): void => {
  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
};

const readChild = (id: string): TBoxSceneNode => selectActivePage(store.getState()).nodes[id] as TBoxSceneNode;

describe('useColumnGridChildSpan', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should not be a grid child when nothing is selected', () => {
    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(result.current).toMatchObject({ columnSpan: '1', isGridChild: false, rowSpan: '1' });
  });

  it('should not be a grid child when the parent frame is not a grid', () => {
    // mock
    const frameId = addFrame(LayoutMode.horizontal);
    const rectangleId = addRectangle();

    moveIntoParent(rectangleId, frameId);
    store.dispatch(setSelection([rectangleId]));

    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(result.current.isGridChild).toBe(false);
  });

  it('should not be a grid child for a top-level node', () => {
    // mock
    const rectangleId = addRectangle();

    store.dispatch(setSelection([rectangleId]));

    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(result.current.isGridChild).toBe(false);
  });

  it('should be a grid child when the parent frame is a grid, defaulting the spans to 1', () => {
    // mock
    const frameId = addFrame(LayoutMode.grid);
    const rectangleId = addRectangle();

    moveIntoParent(rectangleId, frameId);
    store.dispatch(setSelection([rectangleId]));

    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(result.current).toMatchObject({ columnSpan: '1', isGridChild: true, rowSpan: '1' });
  });

  it('should expose the explicit column and row span of a grid child', () => {
    // mock
    const frameId = addFrame(LayoutMode.grid);
    const rectangleId = addRectangle();

    moveIntoParent(rectangleId, frameId);
    store.dispatch(updateNode({ changes: { gridColumnCount: 4, gridRowCount: 3 }, id: frameId }));
    store.dispatch(updateNode({ changes: { gridColumnSpan: 4, gridRowSpan: 3 }, id: rectangleId }));
    store.dispatch(setSelection([rectangleId]));

    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(result.current).toMatchObject({ columnSpan: '4', rowSpan: '3' });
  });

  it('should cap the span at the current grid column count and the effective row count', () => {
    // mock
    const frameId = addFrame(LayoutMode.grid);
    const rectangleId = addRectangle();

    moveIntoParent(rectangleId, frameId);
    store.dispatch(updateNode({ changes: { gridColumnCount: 3 }, id: frameId }));
    store.dispatch(setSelection([rectangleId]));

    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(result.current.maxColumnSpan).toBe(3);
    expect(result.current.maxRowSpan).toBe(1);
  });

  it('should cap the column span at the free run ahead of the child, not the grid width', () => {
    // mock: 4-column grid, first child spans 2 columns, so the second lands at column 2
    const frameId = addFrame(LayoutMode.grid);
    const firstId = addRectangle();
    const secondId = addRectangle();

    // moveIntoParent always inserts at index 0, so move the second child first to end up [first, second]
    moveIntoParent(secondId, frameId);
    moveIntoParent(firstId, frameId);
    store.dispatch(updateNode({ changes: { gridColumnCount: 4 }, id: frameId }));
    store.dispatch(updateNode({ changes: { gridColumnSpan: 2 }, id: firstId }));
    store.dispatch(setSelection([secondId]));

    // before
    const { result } = renderUseColumnGridChildSpan();

    // result — from column 2 only columns 2 and 3 are reachable
    expect(result.current.maxColumnSpan).toBe(2);
  });

  it('should commit a valid column and row span for a grid child', () => {
    // mock
    const frameId = addFrame(LayoutMode.grid);
    const rectangleId = addRectangle();

    moveIntoParent(rectangleId, frameId);
    store.dispatch(updateNode({ changes: { gridColumnCount: 3, gridRowCount: 3 }, id: frameId }));
    store.dispatch(setSelection([rectangleId]));

    const { result } = renderUseColumnGridChildSpan();

    // action
    act(() => result.current.onCommitColumnSpan('2'));
    act(() => result.current.onCommitRowSpan('3'));

    // result
    expect(readChild(rectangleId)).toMatchObject({ gridColumnSpan: 2, gridRowSpan: 3 });
  });

  it('should reject a span that reaches past the current grid state', () => {
    // mock
    const frameId = addFrame(LayoutMode.grid);
    const rectangleId = addRectangle();

    moveIntoParent(rectangleId, frameId);
    store.dispatch(updateNode({ changes: { gridColumnCount: 2, gridRowCount: 2 }, id: frameId }));
    store.dispatch(updateNode({ changes: { gridColumnSpan: 2, gridRowSpan: 2 }, id: rectangleId }));
    store.dispatch(setSelection([rectangleId]));

    const { result } = renderUseColumnGridChildSpan();

    // action
    act(() => result.current.onCommitColumnSpan('5'));
    act(() => result.current.onCommitRowSpan('0'));

    // result
    expect(readChild(rectangleId)).toMatchObject({ gridColumnSpan: 2, gridRowSpan: 2 });
  });

  it('should accept but not write a span commit that matches the current value', () => {
    // mock
    const frameId = addFrame(LayoutMode.grid);
    const rectangleId = addRectangle();

    moveIntoParent(rectangleId, frameId);
    store.dispatch(updateNode({ changes: { gridColumnCount: 3, gridRowCount: 3 }, id: frameId }));
    store.dispatch(setSelection([rectangleId]));

    const { result } = renderUseColumnGridChildSpan();

    // action — both fields still show 1
    let columnResult = false;
    let rowResult = false;

    act(() => {
      columnResult = result.current.onCommitColumnSpan('1');
    });
    act(() => {
      rowResult = result.current.onCommitRowSpan('1');
    });

    // result — accepted (no revert) but nothing dispatched
    expect(columnResult).toBe(true);
    expect(rowResult).toBe(true);
    expect(readChild(rectangleId).gridColumnSpan).toBeUndefined();
    expect(readChild(rectangleId).gridRowSpan).toBeUndefined();
  });

  it('should do nothing when committing a span with no grid child selected', () => {
    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(() => act(() => result.current.onCommitColumnSpan('2'))).not.toThrow();
    expect(() => act(() => result.current.onCommitRowSpan('2'))).not.toThrow();
  });
});
