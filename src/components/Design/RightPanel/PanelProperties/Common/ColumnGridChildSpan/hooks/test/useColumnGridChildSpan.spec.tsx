import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useColumnGridChildSpan } from '../useColumnGridChildSpan';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

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

describe('useColumnGridChildSpan', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should not be a grid child when nothing is selected', () => {
    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(result.current).toEqual({ columnSpan: 1, isGridChild: false, rowSpan: 1 });
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
    expect(result.current).toEqual({ columnSpan: 1, isGridChild: true, rowSpan: 1 });
  });

  it('should expose the explicit column and row span of a grid child', () => {
    // mock
    const frameId = addFrame(LayoutMode.grid);
    const rectangleId = addRectangle();

    moveIntoParent(rectangleId, frameId);
    store.dispatch(updateNode({ changes: { gridColumnSpan: 4, gridRowSpan: 3 }, id: rectangleId }));
    store.dispatch(setSelection([rectangleId]));

    // before
    const { result } = renderUseColumnGridChildSpan();

    // result
    expect(result.current).toEqual({ columnSpan: 4, isGridChild: true, rowSpan: 3 });
  });
});
