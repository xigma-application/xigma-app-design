import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useColumnAlignmentLayout } from '../useColumnAlignmentLayout';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentLayout, AlignTextBaseline, GapMode, LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnAlignmentLayout = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnAlignmentLayout>, unknown>> =>
  renderHook(() => useColumnAlignmentLayout(), { wrapper });

const addFrameNode = (layoutMode?: LayoutMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      layoutMode,
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

describe('useColumnAlignmentLayout', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should not be visible when nothing is selected', () => {
    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isVisible).toBe(false);
  });

  it('should not be visible for a free form frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.freeForm);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isVisible).toBe(false);
  });

  it('should not be visible for a grid frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.grid);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isVisible).toBe(false);
  });

  it('should be visible for a vertical frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.vertical);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isVisible).toBe(true);
    expect(result.current.isHorizontal).toBe(false);
  });

  it('should be visible and horizontal for a horizontal frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isVisible).toBe(true);
    expect(result.current.isHorizontal).toBe(true);
  });

  it('should default the alignment to top left', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.alignment).toBe(AlignmentLayout.topLeft);
  });

  it('should default wrap to false', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isWrap).toBe(false);
  });

  it('should read the selected frame’s existing wrap flag', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { layoutWrap: true }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isWrap).toBe(true);
  });

  it('should dispatch the new alignment on change', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onChangeAlignment(AlignmentLayout.center));

    // result
    expect(readNode(frameId).layoutAlignment).toBe(AlignmentLayout.center);
  });

  it('should default isBaselineAligned to false', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isBaselineAligned).toBe(false);
  });

  it('should be baseline aligned when a horizontal frame has align text baseline on', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { alignTextBaseline: AlignTextBaseline.on }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isBaselineAligned).toBe(true);
  });

  it('should not be baseline aligned when a vertical frame has align text baseline on', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.vertical);

    store.dispatch(updateNode({ changes: { alignTextBaseline: AlignTextBaseline.on }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isBaselineAligned).toBe(false);
  });

  it('should turn align text baseline off on remove baseline alignment', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { alignTextBaseline: AlignTextBaseline.on }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onRemoveBaselineAlignment());

    // result
    expect(readNode(frameId).alignTextBaseline).toBe(AlignTextBaseline.off);
  });

  it('should read the frame’s own horizontalGap and verticalGap directly, for a horizontal frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { horizontalGap: 10, verticalGap: 30 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.horizontalGap).toBe(10);
    expect(result.current.verticalGap).toBe(30);
  });

  it('should read the frame’s own horizontalGap and verticalGap directly, for a vertical frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.vertical);

    store.dispatch(updateNode({ changes: { horizontalGap: 10, verticalGap: 30 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.horizontalGap).toBe(10);
    expect(result.current.verticalGap).toBe(30);
  });

  it('should default verticalGap to the horizontal frame’s own horizontalGap when unset', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { horizontalGap: 10 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.verticalGap).toBe(10);
  });

  it('should default a vertical frame’s unset horizontalGap to zero, with no fallback to verticalGap', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.vertical);

    store.dispatch(updateNode({ changes: { verticalGap: 10 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.horizontalGap).toBe(0);
  });

  it('should dispatch horizontalGap when committing the horizontal gap', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onCommitHorizontalGap(24));

    // result
    expect(readNode(frameId).horizontalGap).toBe(24);
  });

  it('should dispatch verticalGap when committing the vertical gap', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onCommitVerticalGap(24));

    // result
    expect(readNode(frameId).verticalGap).toBe(24);
    expect(readNode(frameId).horizontalGap).toBeUndefined();
  });

  it('should clear horizontalGapMode back to fixed when committing a typed value while auto', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { horizontalGapMode: GapMode.auto }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onCommitHorizontalGap(42));

    // result
    expect(readNode(frameId).horizontalGap).toBe(42);
    expect(readNode(frameId).horizontalGapMode).toBeUndefined();
  });

  it('should default both gap modes to fixed (not auto)', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.horizontalGapMode).toBe(GapMode.fixed);
    expect(result.current.verticalGapMode).toBe(GapMode.fixed);
  });

  it('should switch horizontalGapMode from fixed to auto and back', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { rerender, result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onSelectHorizontalGapAuto());
    rerender();

    // result
    expect(readNode(frameId).horizontalGapMode).toBe(GapMode.auto);
    expect(result.current.horizontalGapMode).toBe(GapMode.auto);

    // action
    act(() => result.current.onSelectHorizontalGapFixed());
    rerender();

    // result
    expect(readNode(frameId).horizontalGapMode).toBeUndefined();
  });

  it('should switch verticalGapMode from fixed to auto and back', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.vertical);

    store.dispatch(setSelection([frameId]));

    // before
    const { rerender, result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onSelectVerticalGapAuto());
    rerender();

    // result
    expect(readNode(frameId).verticalGapMode).toBe(GapMode.auto);
    expect(result.current.verticalGapMode).toBe(GapMode.auto);

    // action
    act(() => result.current.onSelectVerticalGapFixed());
    rerender();

    // result
    expect(readNode(frameId).verticalGapMode).toBeUndefined();
  });

  it('should show the live distributed value while auto, and commit that value on switching back to fixed', () => {
    // mock — a 400-wide horizontal frame with two 40-wide children (flush at x=0 / x=360, no fixed gap)
    const frameId = addFrameNode(LayoutMode.horizontal);
    const childA = addFrameNode();
    const childB = addFrameNode();

    store.dispatch(updateNode({ changes: { width: 400 }, id: frameId }));
    store.dispatch(updateNode({ changes: { childIds: [childA, childB] }, id: frameId }));
    store.dispatch(updateNode({ changes: { parentId: frameId, width: 40, x: 0 }, id: childA }));
    store.dispatch(updateNode({ changes: { parentId: frameId, width: 40, x: 360 }, id: childB }));
    store.dispatch(setSelection([frameId]));

    // before
    const { rerender, result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onSelectHorizontalGapAuto());
    rerender();

    // result — the field reads the real 320px gap between the two children, not the stale stored 0
    expect(result.current.horizontalGap).toBe(320);

    // action
    act(() => result.current.onSelectHorizontalGapFixed());
    rerender();

    // result — switching back to fixed commits that live value, instead of reverting to the old one
    expect(readNode(frameId).horizontalGap).toBe(320);
  });

  it('should disable the horizontal gap mode toggle when the width sizing mode hugs its content', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { widthSizingMode: SizingMode.hug }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isHorizontalGapModeDisabled).toBe(true);
    expect(result.current.isVerticalGapModeDisabled).toBe(false);
  });

  it('should disable the vertical gap mode toggle when the height sizing mode hugs its content', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.vertical);

    store.dispatch(updateNode({ changes: { heightSizingMode: SizingMode.hug }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // result
    expect(result.current.isVerticalGapModeDisabled).toBe(true);
    expect(result.current.isHorizontalGapModeDisabled).toBe(false);
  });
});
