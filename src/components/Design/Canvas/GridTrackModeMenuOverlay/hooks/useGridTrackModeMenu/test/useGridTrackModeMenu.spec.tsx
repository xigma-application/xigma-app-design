import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useGridTrackModeMenu } from '../useGridTrackModeMenu';

// store
import { addNode, deleteNode, setGridTrackModeMenuRequest, setGridTrackSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

const addFrame = (gridColumnSizes?: { mode: SizingMode; value?: number }[]): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      gridColumnCount: gridColumnSizes?.length ?? 2,
      gridColumnSizes,
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 400,
      x: 0,
      y: 0,
    } as never),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const renderMenu = (): { result: { current: ReturnType<typeof useGridTrackModeMenu> } } => {
  const { result } = renderHook(() => useGridTrackModeMenu(), { wrapper });

  return { result };
};

describe('useGridTrackModeMenu', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setGridTrackModeMenuRequest(null));
    store.dispatch(setGridTrackSelection(null));
  });

  it('should stay closed when there is no menu request', () => {
    const { result } = renderMenu();

    expect(result.current.isOpen).toBe(false);
    expect(result.current.options).toEqual([]);
    expect(result.current.mode).toBeNull();
  });

  it('should open with the track’s current mode and the three sizing options when a request targets a valid track', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { result } = renderMenu();

    act(() => store.dispatch(setGridTrackModeMenuRequest({ axis: 'column', frameId, index: 0 })));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.mode).toBe(SizingMode.fixed);
    expect(result.current.options.map((option) => option.value)).toEqual([SizingMode.fixed, SizingMode.hug, SizingMode.fill]);
  });

  it('should close back to idle when the request is withdrawn', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { result } = renderMenu();
    act(() => store.dispatch(setGridTrackModeMenuRequest({ axis: 'column', frameId, index: 0 })));

    act(() => store.dispatch(setGridTrackModeMenuRequest(null)));

    expect(result.current.isOpen).toBe(false);
  });

  it('should close without throwing when the requested frame no longer resolves', () => {
    const { result } = renderMenu();

    act(() => store.dispatch(setGridTrackModeMenuRequest({ axis: 'column', frameId: 'gone', index: 0 })));

    expect(result.current.isOpen).toBe(false);
  });

  it('should clear the request when onOpenChange(false) is called, as on an outside click', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { result } = renderMenu();
    act(() => store.dispatch(setGridTrackModeMenuRequest({ axis: 'column', frameId, index: 0 })));

    act(() => result.current.onOpenChange(false));

    expect(store.getState().design.gridTrackModeMenuRequest).toBeNull();
  });

  it('should commit the picked mode and close the menu on select', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { result } = renderMenu();
    act(() => store.dispatch(setGridTrackModeMenuRequest({ axis: 'column', frameId, index: 0 })));

    act(() => result.current.onSelectMode(SizingMode.hug));

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ gridColumnSizes: [{ mode: SizingMode.hug, value: 40 }] });
    expect(result.current.isOpen).toBe(false);
    expect(store.getState().design.gridTrackModeMenuRequest).toBeNull();
  });

  it('should apply the picked mode to the whole multi-selection when the clicked track is part of it', () => {
    const frameId = addFrame([
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
    ]);
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId, indices: [0, 1] }));
    const { result } = renderMenu();
    act(() => store.dispatch(setGridTrackModeMenuRequest({ axis: 'column', frameId, index: 0 })));

    act(() => result.current.onSelectMode(SizingMode.hug));

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.hug, value: 40 },
        { mode: SizingMode.hug, value: 60 },
      ],
    });
  });

  it('should be a no-op to select a mode with nothing open', () => {
    const { result } = renderMenu();

    expect(() => act(() => result.current.onSelectMode(SizingMode.hug))).not.toThrow();
    expect(result.current.isOpen).toBe(false);
  });
});
