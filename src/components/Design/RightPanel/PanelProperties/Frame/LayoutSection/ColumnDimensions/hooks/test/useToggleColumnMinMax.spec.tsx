import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useToggleColumnMinMax } from '../useToggleColumnMinMax';

// store
import { addNode, setMinMaxRevealed, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

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
const readRevealed = (): ReturnType<typeof store.getState>['design']['revealedMinMax'] => store.getState().design.revealedMinMax;

describe('useToggleColumnMinMax', () => {
  beforeEach(() => {
    (['maxHeight', 'maxWidth', 'minHeight', 'minWidth'] as const).forEach((bound) => {
      store.dispatch(setMinMaxRevealed({ bound, value: false }));
    });
  });

  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should reveal an empty minWidth row without writing anything to the node', () => {
    // mock
    const frameId = addFrameNode();
    const node = readNode(frameId);

    // before
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action
    act(() => result.current.toggleMinWidth());

    // result
    expect(readNode(frameId).minWidth).toBeUndefined();
    expect(store.getState().design.revealedMinMax.minWidth).toBe(true);
  });

  it('should hide the revealed-but-empty minWidth row on a second toggle, still writing nothing', () => {
    // mock
    const frameId = addFrameNode();
    const node = readNode(frameId);
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action — first click reveals it, second click hides it again
    act(() => result.current.toggleMinWidth());
    act(() => result.current.toggleMinWidth());

    // result
    expect(readNode(frameId).minWidth).toBeUndefined();
    expect(store.getState().design.revealedMinMax.minWidth).toBe(false);
  });

  it('should clear a real minWidth value and un-reveal the row when toggled off', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minWidth: 40 }, id: frameId }));

    const node = readNode(frameId);
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action
    act(() => result.current.toggleMinWidth());

    // result
    expect(readNode(frameId).minWidth).toBeUndefined();
    expect(store.getState().design.revealedMinMax.minWidth).toBe(false);
  });

  it('should reveal an empty maxWidth row without writing anything to the node', () => {
    // mock
    const frameId = addFrameNode();
    const node = readNode(frameId);

    // before
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action
    act(() => result.current.toggleMaxWidth());

    // result
    expect(readNode(frameId).maxWidth).toBeUndefined();
    expect(store.getState().design.revealedMinMax.maxWidth).toBe(true);
  });

  it('should clear a real maxWidth value and un-reveal the row when toggled off', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxWidth: 150 }, id: frameId }));

    const node = readNode(frameId);
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action
    act(() => result.current.toggleMaxWidth());

    // result
    expect(readNode(frameId).maxWidth).toBeUndefined();
    expect(store.getState().design.revealedMinMax.maxWidth).toBe(false);
  });

  it('should reveal an empty minHeight row without writing anything to the node', () => {
    // mock
    const frameId = addFrameNode();
    const node = readNode(frameId);

    // before
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action
    act(() => result.current.toggleMinHeight());

    // result
    expect(readNode(frameId).minHeight).toBeUndefined();
    expect(store.getState().design.revealedMinMax.minHeight).toBe(true);
  });

  it('should clear a real minHeight value and un-reveal the row when toggled off', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minHeight: 10 }, id: frameId }));

    const node = readNode(frameId);
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action
    act(() => result.current.toggleMinHeight());

    // result
    expect(readNode(frameId).minHeight).toBeUndefined();
    expect(store.getState().design.revealedMinMax.minHeight).toBe(false);
  });

  it('should reveal an empty maxHeight row without writing anything to the node', () => {
    // mock
    const frameId = addFrameNode();
    const node = readNode(frameId);

    // before
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action
    act(() => result.current.toggleMaxHeight());

    // result
    expect(readNode(frameId).maxHeight).toBeUndefined();
    expect(store.getState().design.revealedMinMax.maxHeight).toBe(true);
  });

  it('should clear a real maxHeight value and un-reveal the row when toggled off', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxHeight: 90 }, id: frameId }));

    const node = readNode(frameId);
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    // action
    act(() => result.current.toggleMaxHeight());

    // result
    expect(readNode(frameId).maxHeight).toBeUndefined();
    expect(store.getState().design.revealedMinMax.maxHeight).toBe(false);
  });

  it('should expose hasMinWidth as true once revealed, even with no real value on the node', () => {
    // mock
    const frameId = addFrameNode();
    const node = readNode(frameId);
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, node), { wrapper });

    expect(result.current.hasMinWidth).toBe(false);

    // action
    act(() => result.current.toggleMinWidth());

    // result
    expect(result.current.hasMinWidth).toBe(true);
    expect(readRevealed().minWidth).toBe(true);
  });

  it('should not throw when there is no node', () => {
    // before
    const { result } = renderHook(() => useToggleColumnMinMax('missing-id', undefined), { wrapper });

    // action / result
    expect(() => act(() => result.current.toggleMinWidth())).not.toThrow();
  });
});
