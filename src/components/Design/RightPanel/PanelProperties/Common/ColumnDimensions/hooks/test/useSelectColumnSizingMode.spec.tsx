import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useSelectColumnSizingMode } from '../useSelectColumnSizingMode';

// store
import { addNode, moveNodes, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addAutoLayoutFrameNode = (widthSizingMode?: SizingMode, heightSizingMode?: SizingMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      heightSizingMode,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      widthSizingMode,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

const moveIntoParent = (childId: string, parentId: string): void => {
  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
};

describe('useSelectColumnSizingMode', () => {
  it('should set the width sizing mode directly onto the node', () => {
    // mock
    const frameId = addAutoLayoutFrameNode();
    const frameNode = readNode(frameId);
    const { nodes } = selectActivePage(store.getState());

    // before
    const { result } = renderHook(() => useSelectColumnSizingMode(frameId, frameNode, nodes, false), { wrapper });

    // action
    act(() => result.current.selectWidthSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId).widthSizingMode).toBe(SizingMode.hug);
  });

  it('should unlock the aspect ratio when switching the height axis away from fixed while locked', () => {
    // mock
    const frameId = addAutoLayoutFrameNode();
    const frameNode = readNode(frameId);
    const { nodes } = selectActivePage(store.getState());

    // before
    const { result } = renderHook(() => useSelectColumnSizingMode(frameId, frameNode, nodes, true), { wrapper });

    // action
    act(() => result.current.selectHeightSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId).lockedAspectRatio).toBe(false);
  });

  it('should leave the lock untouched when switching the width axis to fixed', () => {
    // mock
    const frameId = addAutoLayoutFrameNode();

    store.dispatch(updateNode({ changes: { lockedAspectRatio: true }, id: frameId }));

    const frameNode = readNode(frameId);
    const { nodes } = selectActivePage(store.getState());

    // before
    const { result } = renderHook(() => useSelectColumnSizingMode(frameId, frameNode, nodes, true), { wrapper });

    // action
    act(() => result.current.selectWidthSizingMode(SizingMode.fixed));

    // result
    expect(readNode(frameId).lockedAspectRatio).toBe(true);
  });

  it('should reset a filling child back to fixed on the matching axis when the parent switches that axis to hug', () => {
    // mock
    const parentId = addAutoLayoutFrameNode(SizingMode.fixed, SizingMode.fixed);
    const childId = addAutoLayoutFrameNode();

    moveIntoParent(childId, parentId);
    store.dispatch(updateNode({ changes: { widthSizingMode: SizingMode.fill }, id: childId }));

    const parentNode = readNode(parentId);
    const { nodes } = selectActivePage(store.getState());

    // before
    const { result } = renderHook(() => useSelectColumnSizingMode(parentId, parentNode, nodes, false), { wrapper });

    // action
    act(() => result.current.selectWidthSizingMode(SizingMode.hug));

    // result
    expect(readNode(parentId).widthSizingMode).toBe(SizingMode.hug);
    expect(readNode(childId).widthSizingMode).toBe(SizingMode.fixed);
  });

  it('should reset a filling child back to fixed on the matching axis when the parent switches its height axis to hug', () => {
    // mock
    const parentId = addAutoLayoutFrameNode(SizingMode.fixed, SizingMode.fixed);
    const childId = addAutoLayoutFrameNode();

    moveIntoParent(childId, parentId);
    store.dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fill }, id: childId }));

    const parentNode = readNode(parentId);
    const { nodes } = selectActivePage(store.getState());

    // before
    const { result } = renderHook(() => useSelectColumnSizingMode(parentId, parentNode, nodes, false), { wrapper });

    // action
    act(() => result.current.selectHeightSizingMode(SizingMode.hug));

    // result
    expect(readNode(parentId).heightSizingMode).toBe(SizingMode.hug);
    expect(readNode(childId).heightSizingMode).toBe(SizingMode.fixed);
  });

  it('should not try to reset any children when there is no frame node', () => {
    // before
    const { result } = renderHook(() => useSelectColumnSizingMode('missing-id', undefined, {}, false), { wrapper });

    // action / result
    expect(() => act(() => result.current.selectWidthSizingMode(SizingMode.hug))).not.toThrow();
    expect(() => act(() => result.current.selectHeightSizingMode(SizingMode.hug))).not.toThrow();
  });
});
