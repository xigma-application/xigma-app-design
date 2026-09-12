import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useColumnFlow } from '../useColumnFlow';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnFlow = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnFlow>, unknown>> =>
  renderHook(() => useColumnFlow(), { wrapper });

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrameNode = (layoutMode: LayoutMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      layoutMode,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

const moveIntoParent = (childId: string, parentId: string): void => {
  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
};

describe('useColumnFlow', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to the "freeForm" value when nothing is selected', () => {
    // before
    const { result } = renderUseColumnFlow();

    // result
    expect(result.current.value).toBe('freeForm');
  });

  it('should expose one toggle button per flow option', () => {
    // before
    const { result } = renderUseColumnFlow();

    // result
    expect(result.current.toggleButtons.map((button) => button.value)).toEqual(['freeForm', 'vertical', 'horizontal', 'grid']);
  });

  it('should read the selected frame layout mode', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    // result
    expect(result.current.value).toBe(LayoutMode.freeForm);
  });

  it('should dispatch the new layout mode on change', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    // action
    act(() => result.current.onChange('vertical'));

    // result
    expect(readNode(frameId).layoutMode).toBe(LayoutMode.vertical);
  });

  it('should reset wrap when the flow is changed to a different value', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { layoutMode: LayoutMode.horizontal, layoutWrap: true }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    expect(result.current.wrap).toBe(true);

    // action
    act(() => result.current.onChange('vertical'));

    // result
    expect(readNode(frameId).layoutWrap).toBe(false);
    expect(result.current.wrap).toBe(false);
  });

  it('should default wrap to false', () => {
    // before
    const { result } = renderUseColumnFlow();

    // result
    expect(result.current.wrap).toBe(false);
  });

  it('should read the selected frame’s existing wrap flag', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { layoutWrap: true }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    // result
    expect(result.current.wrap).toBe(true);
  });

  it('should dispatch the toggled wrap flag on the selected frame', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    // action
    act(() => result.current.onWrapChange());

    // result
    expect(readNode(frameId).layoutWrap).toBe(true);
    expect(result.current.wrap).toBe(true);

    // action
    act(() => result.current.onWrapChange());

    // result
    expect(readNode(frameId).layoutWrap).toBe(false);
    expect(result.current.wrap).toBe(false);
  });

  it('should reset the vertical gap to zero when wrap is turned off', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { layoutWrap: true, verticalGap: 24 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    expect(readNode(frameId).verticalGap).toBe(24);

    // action
    act(() => result.current.onWrapChange());

    // result
    expect(readNode(frameId).layoutWrap).toBe(false);
    expect(readNode(frameId).verticalGap).toBe(0);
  });

  it('should reset a direct child’s fill on both axes back to fixed when the parent flow switches to freeForm', () => {
    // mock
    const parentId = addAutoLayoutFrameNode(LayoutMode.horizontal);
    const childId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    moveIntoParent(childId, parentId);
    store.dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }, id: childId }));
    store.dispatch(setSelection([parentId]));

    // before
    const { result } = renderUseColumnFlow();

    // action — the parent stops being an auto-layout frame, so it has no leftover space to hand out
    act(() => result.current.onChange('freeForm'));

    // result
    expect(readNode(parentId).layoutMode).toBe(LayoutMode.freeForm);
    expect(readNode(childId).widthSizingMode).toBe(SizingMode.fixed);
    expect(readNode(childId).heightSizingMode).toBe(SizingMode.fixed);
  });

  it('should keep a direct child’s fill when the parent flow switches to grid, since the grid engine manages it', () => {
    // mock
    const parentId = addAutoLayoutFrameNode(LayoutMode.vertical);
    const childId = addAutoLayoutFrameNode(LayoutMode.vertical);

    moveIntoParent(childId, parentId);
    store.dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }, id: childId }));
    store.dispatch(setSelection([parentId]));

    // before
    const { result } = renderUseColumnFlow();

    // action — a grid child that fills stretches to its cell, so the fill mode stays meaningful
    act(() => result.current.onChange('grid'));

    // result
    expect(readNode(parentId).layoutMode).toBe(LayoutMode.grid);
    expect(readNode(childId).widthSizingMode).toBe(SizingMode.fill);
    expect(readNode(childId).heightSizingMode).toBe(SizingMode.fill);
  });

  it('should seed a default column count the first time a frame switches to grid', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    // action
    act(() => result.current.onChange('grid'));

    // result
    expect(readNode(frameId).gridColumnCount).toBe(2);
  });

  it('should not overwrite an existing column count when switching back to grid', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { gridColumnCount: 5 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    // action
    act(() => result.current.onChange('grid'));

    // result
    expect(readNode(frameId).gridColumnCount).toBe(5);
  });

  it('should default gridAutoPlacement to true', () => {
    // before
    const { result } = renderUseColumnFlow();

    // result
    expect(result.current.gridAutoPlacement).toBe(true);
  });

  it('should read the selected frame’s existing gridAutoPlacement flag', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    // result
    expect(result.current.gridAutoPlacement).toBe(false);
  });

  it('should dispatch the toggled gridAutoPlacement flag on the selected frame', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnFlow();

    // action
    act(() => result.current.onGridAutoPlacementChange());

    // result
    expect(readNode(frameId).gridAutoPlacement).toBe(false);
    expect(result.current.gridAutoPlacement).toBe(false);

    // action
    act(() => result.current.onGridAutoPlacementChange());

    // result
    expect(readNode(frameId).gridAutoPlacement).toBe(true);
    expect(result.current.gridAutoPlacement).toBe(true);
  });

  it('should leave a direct child’s fill untouched when flipping between horizontal and vertical', () => {
    // mock
    const parentId = addAutoLayoutFrameNode(LayoutMode.horizontal);
    const childId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    moveIntoParent(childId, parentId);
    store.dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fill, widthSizingMode: SizingMode.fill }, id: childId }));
    store.dispatch(setSelection([parentId]));

    // before
    const { result } = renderUseColumnFlow();

    // action — both physical axes stay managed by the layout, just their primary/counter role swaps
    act(() => result.current.onChange('vertical'));

    // result
    expect(readNode(parentId).layoutMode).toBe(LayoutMode.vertical);
    expect(readNode(childId).widthSizingMode).toBe(SizingMode.fill);
    expect(readNode(childId).heightSizingMode).toBe(SizingMode.fill);
  });
});
