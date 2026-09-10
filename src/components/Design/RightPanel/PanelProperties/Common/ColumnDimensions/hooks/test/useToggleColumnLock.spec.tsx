import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useToggleColumnLock } from '../useToggleColumnLock';

// store
import { addNode, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, SizingMode } from 'types/design/enums';
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

describe('useToggleColumnLock', () => {
  it('should toggle the lock state on', () => {
    // mock
    const frameId = addFrameNode();

    // before
    const { result } = renderHook(() => useToggleColumnLock(frameId, false, SizingMode.fixed, SizingMode.fixed), { wrapper });

    // action
    act(() => result.current());

    // result
    expect(readNode(frameId).lockedAspectRatio).toBe(true);
  });

  it('should reset both sizing modes to fixed when locking while the width axis is not fixed', () => {
    // mock
    const frameId = addFrameNode();

    // before
    const { result } = renderHook(() => useToggleColumnLock(frameId, false, SizingMode.hug, SizingMode.fixed), { wrapper });

    // action
    act(() => result.current());

    // result
    expect(readNode(frameId)).toMatchObject({
      heightSizingMode: SizingMode.fixed,
      lockedAspectRatio: true,
      widthSizingMode: SizingMode.fixed,
    });
  });

  it('should reset both sizing modes to fixed when locking while the height axis is not fixed', () => {
    // mock
    const frameId = addFrameNode();

    // before
    const { result } = renderHook(() => useToggleColumnLock(frameId, false, SizingMode.fixed, SizingMode.hug), { wrapper });

    // action
    act(() => result.current());

    // result
    expect(readNode(frameId)).toMatchObject({
      heightSizingMode: SizingMode.fixed,
      lockedAspectRatio: true,
      widthSizingMode: SizingMode.fixed,
    });
  });

  it('should leave sizing modes untouched when both axes are already fixed while locking', () => {
    // mock
    const frameId = addFrameNode();

    // before
    const { result } = renderHook(() => useToggleColumnLock(frameId, false, SizingMode.fixed, SizingMode.fixed), { wrapper });

    // action
    act(() => result.current());

    // result
    const node = readNode(frameId);

    expect(node.lockedAspectRatio).toBe(true);
    expect(node.widthSizingMode).toBeUndefined();
    expect(node.heightSizingMode).toBeUndefined();
  });

  it('should leave sizing modes untouched when unlocking', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { heightSizingMode: SizingMode.hug, widthSizingMode: SizingMode.hug }, id: frameId }));

    // before
    const { result } = renderHook(() => useToggleColumnLock(frameId, true, SizingMode.hug, SizingMode.hug), { wrapper });

    // action
    act(() => result.current());

    // result
    expect(readNode(frameId)).toMatchObject({
      heightSizingMode: SizingMode.hug,
      lockedAspectRatio: false,
      widthSizingMode: SizingMode.hug,
    });
  });
});
