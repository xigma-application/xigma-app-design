import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useCommitColumnDimensions } from '../useCommitColumnDimensions';

// store
import { addNode, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addFrameNode = (width: number, height: number, widthSizingMode?: SizingMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width,
      widthSizingMode,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('useCommitColumnDimensions', () => {
  it('should commit a new width without touching the height when unlocked', () => {
    // mock
    const frameId = addFrameNode(100, 50);
    const frameNode = readNode(frameId);

    // before
    const { result } = renderHook(() => useCommitColumnDimensions(frameId, frameNode, 100, 50, false), { wrapper });

    // action
    act(() => result.current.commitWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 50, width: 200 });
  });

  it('should scale the height to keep the ratio when locked', () => {
    // mock
    const frameId = addFrameNode(100, 50);
    const frameNode = readNode(frameId);

    // before
    const { result } = renderHook(() => useCommitColumnDimensions(frameId, frameNode, 100, 50, true), { wrapper });

    // action
    act(() => result.current.commitWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 100, width: 200 });
  });

  it('should switch a hugging width axis back to fixed once the width actually changes', () => {
    // mock
    const frameId = addFrameNode(100, 50, SizingMode.hug);
    const frameNode = readNode(frameId);

    // before
    const { result } = renderHook(() => useCommitColumnDimensions(frameId, frameNode, 100, 50, false), { wrapper });

    // action
    act(() => result.current.commitWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ width: 200, widthSizingMode: SizingMode.fixed });
  });

  it('should clamp a committed width down to the node’s own maxWidth', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(updateNode({ changes: { maxWidth: 150 }, id: frameId }));

    const frameNode = readNode(frameId);
    const { result } = renderHook(() => useCommitColumnDimensions(frameId, frameNode, 100, 50, false), { wrapper });

    // action
    act(() => result.current.commitWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ width: 150 });
  });

  it('should clamp a committed height up to the node’s own minHeight', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(updateNode({ changes: { minHeight: 40 }, id: frameId }));

    const frameNode = readNode(frameId);
    const { result } = renderHook(() => useCommitColumnDimensions(frameId, frameNode, 100, 50, false), { wrapper });

    // action
    act(() => result.current.commitHeight(20));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 40 });
  });

  it('should commit a new height without resetting any sizing mode when there is no selected node', () => {
    // mock
    const frameId = addFrameNode(100, 50, SizingMode.hug);

    // before
    const { result } = renderHook(() => useCommitColumnDimensions(frameId, undefined, 100, 50, false), { wrapper });

    // action
    act(() => result.current.commitHeight(80));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 80, width: 100, widthSizingMode: SizingMode.hug });
  });
});
