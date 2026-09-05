import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useColumnFlow } from '../useColumnFlow';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
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

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

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
});
