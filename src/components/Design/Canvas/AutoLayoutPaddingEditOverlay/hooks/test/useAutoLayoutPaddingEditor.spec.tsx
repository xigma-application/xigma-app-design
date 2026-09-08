import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { createCanvasRefs } from '../../../hooks/useCanvasRefs/createCanvasRefs';
import { useAutoLayoutPaddingEditor } from '../useAutoLayoutPaddingEditor';

// store
import { addNode, deleteNode, setViewport, startAutoLayoutPaddingEdit, stopAutoLayoutPaddingEdit } from 'store/design/slice';
import { selectActivePage, selectEditingAutoLayoutPadding } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

const addFrame = (paddingTop = 0): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: 200,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      paddingTop,
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 300,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const renderEditor = (): { refs: TCanvasRefs; result: { current: ReturnType<typeof useAutoLayoutPaddingEditor> } } => {
  const refs = createCanvasRefs();
  const { result } = renderHook(() => useAutoLayoutPaddingEditor(refs), { wrapper });

  return { refs, result };
};

describe('useAutoLayoutPaddingEditor', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));

    const editing = selectEditingAutoLayoutPadding(store.getState());

    if (editing) {
      store.dispatch(stopAutoLayoutPaddingEdit({ frameId: editing.frameId, side: editing.side }));
    }
  });

  it('should stay idle when nothing is being edited', () => {
    // before
    const { refs, result } = renderEditor();

    // result
    expect(result.current.edit).toBeNull();
    expect(refs.transform.autoLayoutPaddingEditRef.current).toBeNull();
  });

  it('should surface the edit details and mirror the state into the ref for the render loop', () => {
    // mock
    const frameId = addFrame(12);

    store.dispatch(startAutoLayoutPaddingEdit({ frameId, point: { x: 100, y: 50 }, side: 'top' }));
    const { refs, result } = renderEditor();

    // result
    expect(result.current.edit).toEqual({
      centerX: 100,
      centerY: 50,
      frameId,
      iconName: 'PaddingT',
      initialValue: 12,
      side: 'top',
    });
    expect(refs.transform.autoLayoutPaddingEditRef.current).toEqual({ frameId, point: { x: 100, y: 50 }, side: 'top' });
  });

  it('should commit the parsed value and close on commit', () => {
    // mock
    const frameId = addFrame(12);

    store.dispatch(startAutoLayoutPaddingEdit({ frameId, point: { x: 100, y: 50 }, side: 'top' }));
    const { refs, result } = renderEditor();

    // before
    act(() => result.current.commit('40'));

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingTop: 40 });
    expect(result.current.edit).toBeNull();
    expect(refs.transform.autoLayoutPaddingEditRef.current).toBeNull();
  });

  it('should strip stray non-digit characters from the committed value', () => {
    // mock
    const frameId = addFrame(12);

    store.dispatch(startAutoLayoutPaddingEdit({ frameId, point: { x: 100, y: 50 }, side: 'top' }));
    const { result } = renderEditor();

    // before
    act(() => result.current.commit('4px'));

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingTop: 4 });
  });

  it('should not touch the node when the committed value is not a number', () => {
    // mock
    const frameId = addFrame(12);

    store.dispatch(startAutoLayoutPaddingEdit({ frameId, point: { x: 100, y: 50 }, side: 'top' }));
    const { result } = renderEditor();

    // before
    act(() => result.current.commit('abc'));

    // result — untouched, but still closed
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingTop: 12 });
    expect(result.current.edit).toBeNull();
  });

  it('should close without touching the node on cancel', () => {
    // mock
    const frameId = addFrame(12);

    store.dispatch(startAutoLayoutPaddingEdit({ frameId, point: { x: 100, y: 50 }, side: 'top' }));
    const { result } = renderEditor();

    // before
    act(() => result.current.cancel());

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ paddingTop: 12 });
    expect(result.current.edit).toBeNull();
  });

  it('should be a no-op when commit or cancel is called with nothing open', () => {
    // mock
    const { result } = renderEditor();

    // before
    act(() => {
      result.current.commit('40');
      result.current.cancel();
    });

    // result
    expect(result.current.edit).toBeNull();
  });
});
