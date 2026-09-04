import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useColumnAlignmentLayout } from '../useColumnAlignmentLayout';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';
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

  it('should dispatch the new gap on scrub', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();

    // action
    act(() => result.current.onScrubGap(24));

    // result
    expect(readNode(frameId).itemSpacing).toBe(24);
  });

  it('should commit a new gap on blur', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();
    const input = Object.assign(document.createElement('input'), { value: '16' });

    // action
    act(() => result.current.onBlurGap({ target: input } as unknown as Parameters<typeof result.current.onBlurGap>[0]));

    // result
    expect(readNode(frameId).itemSpacing).toBe(16);
  });

  it('should revert an invalid gap on blur', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnAlignmentLayout();
    const input = Object.assign(document.createElement('input'), { value: '' });

    // action
    act(() => result.current.onBlurGap({ target: input } as unknown as Parameters<typeof result.current.onBlurGap>[0]));

    // result
    expect(input.value).toBe('0');
    expect(readNode(frameId).itemSpacing).toBeUndefined();
  });
});
