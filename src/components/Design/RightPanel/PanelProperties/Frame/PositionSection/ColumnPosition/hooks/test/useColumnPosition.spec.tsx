import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnPosition } from '../useColumnPosition';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnPosition = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnPosition>, unknown>> =>
  renderHook(() => useColumnPosition(), { wrapper });

const addFrameNode = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): { x: number; y: number } => {
  const node = selectActivePage(store.getState()).nodes[id] as { x: number; y: number };

  return { x: node.x, y: node.y };
};

describe('useColumnPosition', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should expose the selected frame x and y', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();

    // result
    expect(result.current).toMatchObject({ x: 10, y: 20 });
  });

  it('should commit a new x on scrub', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();

    // action
    act(() => result.current.onScrubX(-1010));

    // result
    expect(readNode(frameId).x).toBe(-1010);
  });

  it('should commit a new y on scrub', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();

    // action
    act(() => result.current.onScrubY(-810));

    // result
    expect(readNode(frameId).y).toBe(-810);
  });

  it('should commit a new x on blur', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();
    const input = Object.assign(document.createElement('input'), { value: '55' });

    // action
    act(() => result.current.onBlurX({ target: input } as unknown as Parameters<typeof result.current.onBlurX>[0]));

    // result
    expect(readNode(frameId).x).toBe(55);
  });

  it('should coalesce every scrub between onDragStart and onDragEnd into a single undo step', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onScrubX(100);
      result.current.onScrubX(200);
      result.current.onScrubX(300);
      result.current.onDragEnd();
    });

    expect(readNode(frameId).x).toBe(300);

    // action
    store.dispatch(undo());

    // result
    expect(readNode(frameId).x).toBe(10);
  });
});
