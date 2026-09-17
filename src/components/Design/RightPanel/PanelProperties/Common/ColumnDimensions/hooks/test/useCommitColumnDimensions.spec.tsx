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
import { TImagePaint } from 'types/design/paint/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addFrameNode = (width: number, height: number, widthSizingMode?: SizingMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

  it('should scale a stored image fill’s crop proportionally when committing a new width from the panel, not just via canvas resize', () => {
    // mock — a frame whose crop is centred exactly on its own centre
    const frameId = addFrameNode(100, 50);
    const paint: TImagePaint = {
      crop: { height: 25, rotation: 0, width: 50, x: 25, y: 12.5 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };

    store.dispatch(updateNode({ changes: { fills: [paint] }, id: frameId }));

    const frameNode = readNode(frameId);
    const { result } = renderHook(() => useCommitColumnDimensions(frameId, frameNode, 100, 50, false), { wrapper });

    // action
    act(() => result.current.commitWidth(200));

    // result — the crop doubled in width along with the frame, staying centred
    const updated = readNode(frameId);

    expect(updated.width).toBe(200);
    expect((updated.fills[0] as TImagePaint).crop).toEqual({ height: 25, rotation: 0, width: 100, x: 50, y: 12.5 });
  });
});
