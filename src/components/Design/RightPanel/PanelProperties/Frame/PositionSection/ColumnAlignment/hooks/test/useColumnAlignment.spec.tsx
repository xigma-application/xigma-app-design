import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnAlignment } from '../useColumnAlignment';

// store
import { addNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentHorizontal, AlignmentVertical, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnAlignment = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnAlignment>, unknown>> =>
  renderHook(() => useColumnAlignment(), { wrapper });

const addFrame = (parentId: string | null, width = 40, height = 40): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height,
      name: 'Frame',
      parentId,
      rotation: 0,
      type: NodeType.frame,
      width,
      x: 0,
      y: 0,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const alignmentOf = (id: string): TFrameNode['alignment'] => (selectActivePage(store.getState()).nodes[id] as TFrameNode).alignment;
const positionOf = (id: string): { x: number; y: number } => {
  const node = selectActivePage(store.getState()).nodes[id] as TFrameNode;

  return { x: node.x, y: node.y };
};

describe('useColumnAlignment', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  // a 400x300 parent with a 40x40 child, so anchor math has a clean expected answer
  const nested = (): { childId: string; parentId: string } => {
    const parentId = addFrame(null, 400, 300);
    const childId = addFrame(null, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(setSelection([childId]));

    return { childId, parentId };
  };

  it('should be disabled when the selected frame has no parent', () => {
    store.dispatch(setSelection([addFrame(null)]));

    expect(renderUseColumnAlignment().result.current.disabled).toBe(true);
  });

  it('should set the constraint and move the child to the anchor', () => {
    const { childId } = nested();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.center));

    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.center });
    expect(positionOf(childId).x).toBe((400 - 40) / 2);
  });

  it('should stay at the anchor (idempotent) on a repeated identical select', () => {
    const { childId } = nested();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));
    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));

    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.right });
    expect(positionOf(childId).x).toBe(400 - 40);
  });

  it('should keep the other axis when setting one', () => {
    const { childId } = nested();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.left));
    act(() => result.current.onSelectVertical(AlignmentVertical.bottom));

    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.bottom });
    expect(positionOf(childId)).toEqual({ x: 0, y: 300 - 40 });
  });

  it('should set an exact value via setHorizontal and clear via undefined, without moving the child', () => {
    const { childId } = nested();
    const { result } = renderUseColumnAlignment();
    const before = positionOf(childId);

    act(() => result.current.setHorizontal(AlignmentHorizontal.right));
    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.right });
    expect(positionOf(childId)).toEqual(before);

    act(() => result.current.setHorizontal(undefined));
    expect(alignmentOf(childId)).toBeUndefined();
    expect(positionOf(childId)).toEqual(before);
  });

  it('should expose the current alignment values', () => {
    nested();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.setVertical(AlignmentVertical.center));

    expect(result.current.vertical).toBe(AlignmentVertical.center);
    expect(result.current.horizontal).toBeUndefined();
  });

  it('should still record the constraint even when the frame has no parent to move it against', () => {
    const frameId = addFrame(null);

    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.center));

    expect(alignmentOf(frameId)).toEqual({ horizontal: AlignmentHorizontal.center });
  });

  it('should be a no-op when nothing is selected', () => {
    const { result } = renderUseColumnAlignment();

    expect(() => act(() => result.current.setHorizontal(AlignmentHorizontal.left))).not.toThrow();
  });
});
