import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useGridTrackValueLabelEditor } from '../useGridTrackValueLabelEditor';

// store
import { addNode, deleteNode, setGridTrackValueEditRequest } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

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

const renderEditor = (): {
  refs: TCanvasRefs;
  result: { current: ReturnType<typeof useGridTrackValueLabelEditor> };
} => {
  const refs = createCanvasRefs();
  const { result } = renderHook(() => useGridTrackValueLabelEditor(refs), { wrapper });

  return { refs, result };
};

describe('useGridTrackValueLabelEditor', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setGridTrackValueEditRequest(null));
  });

  it('should stay idle when there is no edit request', () => {
    const { result } = renderEditor();

    expect(result.current.edit).toBeNull();
  });

  it('should open an edit and seed the editing ref when a request targets a valid track', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { refs, result } = renderEditor();

    act(() => store.dispatch(setGridTrackValueEditRequest({ axis: 'column', frameId, index: 0 })));

    expect(result.current.edit).not.toBeNull();
    expect(result.current.edit).toMatchObject({ axis: 'column', frameId, index: 0, value: '40' });
    expect(refs.hover.editingGridTrackValueRef.current).toEqual({ axis: 'column', frameId, index: 0, text: '40' });
  });

  it('should clear back to null and reset the editing ref when the request is withdrawn', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { refs, result } = renderEditor();
    act(() => store.dispatch(setGridTrackValueEditRequest({ axis: 'column', frameId, index: 0 })));

    act(() => store.dispatch(setGridTrackValueEditRequest(null)));

    expect(result.current.edit).toBeNull();
    expect(refs.hover.editingGridTrackValueRef.current).toBeNull();
  });

  it('should close without dispatching anything when the requested frame no longer resolves', () => {
    const { result } = renderEditor();

    act(() => store.dispatch(setGridTrackValueEditRequest({ axis: 'column', frameId: 'gone', index: 0 })));

    expect(result.current.edit).toBeNull();
  });

  it('should update the editing ref text on every live change, keeping the edit open', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { refs, result } = renderEditor();
    act(() => store.dispatch(setGridTrackValueEditRequest({ axis: 'column', frameId, index: 0 })));

    act(() => result.current.liveChange('250'));

    expect(refs.hover.editingGridTrackValueRef.current).toMatchObject({ text: '250' });
    expect(result.current.edit).not.toBeNull();
  });

  it('should be a no-op to call liveChange with nothing open', () => {
    const { refs, result } = renderEditor();

    act(() => result.current.liveChange('250'));

    expect(result.current.edit).toBeNull();
    expect(refs.hover.editingGridTrackValueRef.current).toBeNull();
  });

  it('should commit the typed value and clear the request and editing ref', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { refs, result } = renderEditor();
    act(() => store.dispatch(setGridTrackValueEditRequest({ axis: 'column', frameId, index: 0 })));

    act(() => result.current.commit('90'));

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ gridColumnSizes: [{ mode: SizingMode.fixed, value: 90 }] });
    expect(result.current.edit).toBeNull();
    expect(refs.hover.editingGridTrackValueRef.current).toBeNull();
    expect(store.getState().design.gridTrackValueEditRequest).toBeNull();
  });

  it('should close without dispatching on cancel', () => {
    const frameId = addFrame([{ mode: SizingMode.fixed, value: 40 }]);
    const { refs, result } = renderEditor();
    act(() => store.dispatch(setGridTrackValueEditRequest({ axis: 'column', frameId, index: 0 })));

    act(() => result.current.cancel());

    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ gridColumnSizes: [{ mode: SizingMode.fixed, value: 40 }] });
    expect(result.current.edit).toBeNull();
    expect(refs.hover.editingGridTrackValueRef.current).toBeNull();
  });

  it('should be a no-op to commit with nothing open', () => {
    const { result } = renderEditor();

    expect(() => act(() => result.current.commit('90'))).not.toThrow();
    expect(result.current.edit).toBeNull();
  });
});
