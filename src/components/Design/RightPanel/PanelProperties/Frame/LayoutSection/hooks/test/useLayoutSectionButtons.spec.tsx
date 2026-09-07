import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useLayoutSectionButtons } from '../useLayoutSectionButtons';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseLayoutSectionButtons = (): ReturnType<typeof renderHook<ReturnType<typeof useLayoutSectionButtons>, unknown>> =>
  renderHook(() => useLayoutSectionButtons(), { wrapper });

const addFrameNode = (overrides: Partial<TFrameNode> = {}): string => {
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
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('useLayoutSectionButtons', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the resize-to-fit button when nothing is selected', () => {
    // before
    const { result } = renderUseLayoutSectionButtons();

    // result
    expect(result.current.isResizeToFitVisible).toBe(true);
  });

  it('should show the resize-to-fit button and deselect auto layout for a freeForm frame', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseLayoutSectionButtons();

    // result
    expect(result.current.isResizeToFitVisible).toBe(true);
    expect(result.current.isAutoLayoutSelected).toBe(false);
  });

  it('should hide the resize-to-fit button and select auto layout for a horizontal frame', () => {
    // mock
    const frameId = addFrameNode({ layoutMode: LayoutMode.horizontal });

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseLayoutSectionButtons();

    // result
    expect(result.current.isResizeToFitVisible).toBe(false);
    expect(result.current.isAutoLayoutSelected).toBe(true);
  });

  it('should hide the resize-to-fit button and select auto layout for a grid frame', () => {
    // mock
    const frameId = addFrameNode({ layoutMode: LayoutMode.grid });

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseLayoutSectionButtons();

    // result
    expect(result.current.isResizeToFitVisible).toBe(false);
    expect(result.current.isAutoLayoutSelected).toBe(true);
  });

  it('should switch a freeForm frame to horizontal when the auto-layout button is clicked', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseLayoutSectionButtons();

    // action
    act(() => result.current.onToggleAutoLayout());

    // result
    expect(readNode(frameId).layoutMode).toBe(LayoutMode.horizontal);
  });

  it('should switch a horizontal frame back to freeForm when the auto-layout button is clicked', () => {
    // mock
    const frameId = addFrameNode({ layoutMode: LayoutMode.horizontal });

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseLayoutSectionButtons();

    // action
    act(() => result.current.onToggleAutoLayout());

    // result
    expect(readNode(frameId).layoutMode).toBe(LayoutMode.freeForm);
  });

  it('should switch a grid frame back to freeForm when the auto-layout button is clicked', () => {
    // mock
    const frameId = addFrameNode({ layoutMode: LayoutMode.grid });

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseLayoutSectionButtons();

    // action
    act(() => result.current.onToggleAutoLayout());

    // result
    expect(readNode(frameId).layoutMode).toBe(LayoutMode.freeForm);
  });

  it('should do nothing when the auto-layout button is clicked and nothing is selected', () => {
    // before
    const { result } = renderUseLayoutSectionButtons();

    // action & result — should not throw
    expect(() => act(() => result.current.onToggleAutoLayout())).not.toThrow();
  });
});
