import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useGridSettingsPanel } from '../useGridSettingsPanel';

// store
import { addNode, moveNodes, setGridSettingsPanelOpen, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectIsGridSettingsPanelOpen } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const render = (): ReturnType<typeof renderHook<ReturnType<typeof useGridSettingsPanel>, unknown>> =>
  renderHook(() => useGridSettingsPanel(), { wrapper });

const addGridFrame = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      gridColumnCount: 3,
      gridRowCount: 2,
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const frameId = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([frameId]));

  return frameId;
};

const addChild = (parentId: string, changes: Record<string, unknown> = {}): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 10, name: 'Rect', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { nodes, rootOrder } = selectActivePage(store.getState());
  const childId = rootOrder.filter((id) => nodes[id].type === NodeType.rectangle).at(-1) as string;

  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
  store.dispatch(updateNode({ changes, id: childId }));

  return childId;
};

const readFrame = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;
const readNode = (id: string): Record<string, unknown> => selectActivePage(store.getState()).nodes[id] as Record<string, unknown>;

describe('useGridSettingsPanel', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setGridSettingsPanelOpen(false));
  });

  it('should expose noop controls and still close the panel when no grid frame is selected', () => {
    store.dispatch(setGridSettingsPanelOpen(true));

    const { result } = render();

    expect(result.current.columns.tracks).toEqual([]);
    expect(result.current.columns.onReorder([0], 1)).toBeNull();
    act(() => {
      result.current.columns.onAdd();
      result.current.columns.onChangeMode(0, SizingMode.fixed);
      result.current.columns.onChangeValue(0, 1);
      result.current.columns.onDelete([0]);
      result.current.onClose();
    });

    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(false);
  });

  it('should build view models, defaulting the value to 1 for fill and 0 for non-fill without a value', () => {
    const frameId = addGridFrame();

    store.dispatch(
      updateNode({
        changes: { gridColumnSizes: [{ mode: SizingMode.fill }, { mode: SizingMode.fixed, value: 80 }, { mode: SizingMode.hug }] },
        id: frameId,
      }),
    );

    const { result } = render();

    expect(result.current.columns.tracks).toEqual([
      { index: 0, linkedIndices: [0], mode: SizingMode.fill, value: 1 },
      { index: 1, linkedIndices: [1], mode: SizingMode.fixed, value: 80 },
      { index: 2, linkedIndices: [2], mode: SizingMode.hug, value: 0 },
    ]);
  });

  it('should default the column count to 1 when it is unset', () => {
    addGridFrame({ gridColumnCount: undefined });

    const { result } = render();

    expect(result.current.columns.tracks).toHaveLength(1);
  });

  it('should derive the row count from placed children when it is not explicit', () => {
    const frameId = addGridFrame({ gridRowCount: undefined });

    addChild(frameId);
    addChild(frameId);
    addChild(frameId);
    addChild(frameId);

    const { result } = render();

    expect(result.current.rows.tracks).toHaveLength(2);
  });

  it('should append a fill track and bump the count on add', () => {
    const frameId = addGridFrame();

    const { result } = render();

    act(() => result.current.columns.onAdd());

    expect(readFrame(frameId).gridColumnCount).toBe(4);
    expect(readFrame(frameId).gridColumnSizes).toHaveLength(4);
  });

  it('should switch a track mode, seeding a fill weight and preserving a fixed value', () => {
    const frameId = addGridFrame();

    const { result } = render();

    act(() => result.current.columns.onChangeMode(0, SizingMode.fixed));
    expect(readFrame(frameId).gridColumnSizes?.[0]).toEqual({ mode: SizingMode.fixed, value: 1 });

    act(() => result.current.rows.onChangeMode(0, SizingMode.fill));
    expect(readFrame(frameId).gridRowSizes?.[0]).toEqual({ mode: SizingMode.fill, value: 1 });
  });

  it('should clamp a committed track value to zero', () => {
    const frameId = addGridFrame();

    const { result } = render();

    act(() => result.current.columns.onChangeValue(1, -5));

    expect(readFrame(frameId).gridColumnSizes?.[1]).toEqual({ mode: SizingMode.fill, value: 0 });
  });

  it('should delete a track and clamp the span of a child that covered it', () => {
    const frameId = addGridFrame({ gridAutoPlacement: false });
    const childId = addChild(frameId, { gridColumnAnchorIndex: 0, gridColumnSpan: 3 });

    const { result } = render();

    act(() => result.current.columns.onDelete([2]));

    expect(readFrame(frameId).gridColumnCount).toBe(2);
    expect(readNode(childId).gridColumnSpan).toBe(2);
  });

  it('should exit grid mode and close the panel when the last remaining track is deleted', () => {
    const frameId = addGridFrame({ gridColumnCount: 1 });
    store.dispatch(setGridSettingsPanelOpen(true));

    const { result } = render();

    act(() => result.current.columns.onDelete([0]));

    expect(readFrame(frameId).layoutMode).toBe(LayoutMode.freeForm);
    expect(readFrame(frameId).gridColumnCount).toBeUndefined();
    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(false);
  });

  it('should reorder tracks and carry a manually anchored child along', () => {
    const frameId = addGridFrame({ gridAutoPlacement: false });
    const childId = addChild(frameId, { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0 });

    const { result } = render();

    let newIndices: number[] | null = null;

    act(() => {
      newIndices = result.current.columns.onReorder([2], 0);
    });

    expect(newIndices).toEqual([0]);
    expect(readNode(childId).gridColumnAnchorIndex).toBe(0);
  });

  it('should reject a non-contiguous selection, an identity move and a span-breaking move', () => {
    const frameId = addGridFrame({ gridAutoPlacement: false, gridColumnCount: 4 });

    addChild(frameId, { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0 });

    const { result } = render();

    // non-contiguous selection
    expect(result.current.columns.onReorder([0, 2], 3)).toBeNull();
    // identity move (slot at the block start)
    expect(result.current.columns.onReorder([1], 1)).toBeNull();
    // splitting the wide child's [0,1] span by dropping column 0 past column 1
    expect(result.current.columns.onReorder([0], 3)).toBeNull();
    expect(readFrame(frameId).gridColumnCount).toBe(4);
  });
});
