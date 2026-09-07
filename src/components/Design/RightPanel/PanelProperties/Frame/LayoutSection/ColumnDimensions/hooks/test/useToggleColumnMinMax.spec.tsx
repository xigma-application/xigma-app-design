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
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, readNode(frameId)), { wrapper });

    // action
    act(() => result.current.onRevealMinWidth());

    // result
    expect(readNode(frameId).minWidth).toBeUndefined();
    expect(readRevealed().minWidth).toBe(true);
    expect(result.current.hasMinWidthValue).toBe(false);
  });

  it('should hide the revealed-but-empty minWidth row on a second reveal toggle', () => {
    // mock
    const frameId = addFrameNode();
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, readNode(frameId)), { wrapper });

    // action
    act(() => result.current.onRevealMinWidth());
    act(() => result.current.onRevealMinWidth());

    // result
    expect(readNode(frameId).minWidth).toBeUndefined();
    expect(readRevealed().minWidth).toBe(false);
  });

  it('should keep the row revealed and never clear the value when revealing a bound that has a real value', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minWidth: 40 }, id: frameId }));

    const { result } = renderHook(() => useToggleColumnMinMax(frameId, readNode(frameId)), { wrapper });

    // action — reveal twice; the value must survive both
    act(() => result.current.onRevealMinWidth());
    act(() => result.current.onRevealMinWidth());

    // result
    expect(readNode(frameId).minWidth).toBe(40);
    expect(readRevealed().minWidth).toBe(true);
  });

  it('should expose the real bound value and the shown flag', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxHeight: 90 }, id: frameId }));

    const { result } = renderHook(() => useToggleColumnMinMax(frameId, readNode(frameId)), { wrapper });

    // result
    expect(result.current.maxHeightValue).toBe(90);
    expect(result.current.hasMaxHeightValue).toBe(true);
    expect(result.current.maxHeightShown).toBe(true);
    expect(result.current.minHeightShown).toBe(false);
  });

  it('should clear both width bounds and un-reveal both rows on remove', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxWidth: 150, minWidth: 40 }, id: frameId }));
    store.dispatch(setMinMaxRevealed({ bound: 'minWidth', value: true }));
    store.dispatch(setMinMaxRevealed({ bound: 'maxWidth', value: true }));

    const { result } = renderHook(() => useToggleColumnMinMax(frameId, readNode(frameId)), { wrapper });

    // action
    act(() => result.current.onRemoveWidthBounds());

    // result
    expect(readNode(frameId).minWidth).toBeUndefined();
    expect(readNode(frameId).maxWidth).toBeUndefined();
    expect(readRevealed().minWidth).toBe(false);
    expect(readRevealed().maxWidth).toBe(false);
  });

  it('should clear both height bounds and un-reveal both rows on remove', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxHeight: 90, minHeight: 10 }, id: frameId }));

    const { result } = renderHook(() => useToggleColumnMinMax(frameId, readNode(frameId)), { wrapper });

    // action
    act(() => result.current.onRemoveHeightBounds());

    // result
    expect(readNode(frameId).minHeight).toBeUndefined();
    expect(readNode(frameId).maxHeight).toBeUndefined();
    expect(readRevealed().minHeight).toBe(false);
    expect(readRevealed().maxHeight).toBe(false);
  });

  it('should reveal each empty bound row independently without writing to the node', () => {
    // mock
    const frameId = addFrameNode();
    const { result } = renderHook(() => useToggleColumnMinMax(frameId, readNode(frameId)), { wrapper });

    // action
    act(() => result.current.onRevealMaxWidth());
    act(() => result.current.onRevealMinHeight());
    act(() => result.current.onRevealMaxHeight());

    // result
    expect(readNode(frameId).maxWidth).toBeUndefined();
    expect(readNode(frameId).minHeight).toBeUndefined();
    expect(readNode(frameId).maxHeight).toBeUndefined();
    expect(readRevealed()).toMatchObject({ maxHeight: true, maxWidth: true, minHeight: true });
  });

  it('should not throw when there is no node', () => {
    // before
    const { result } = renderHook(() => useToggleColumnMinMax('missing-id', undefined), { wrapper });

    // action / result
    expect(() => act(() => result.current.onRevealMinWidth())).not.toThrow();
    expect(() => act(() => result.current.onRemoveWidthBounds())).not.toThrow();
  });
});
