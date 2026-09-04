import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnRotation } from '../useColumnRotation';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnRotation = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnRotation>, unknown>> =>
  renderHook(() => useColumnRotation(), { wrapper });

const addFrameNode = (rotation: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readRotation = (id: string): number => (selectActivePage(store.getState()).nodes[id] as { rotation: number }).rotation;

describe('useColumnRotation', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should expose the selected frame rotation', () => {
    // mock
    const frameId = addFrameNode(20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();

    // result
    expect(result.current.rotation).toBe(20);
  });

  it('should expose three rotation/flip buttons', () => {
    // mock
    const frameId = addFrameNode(0);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();

    // result
    expect(result.current.buttons).toHaveLength(3);
  });

  it('should commit a new rotation on scrub', () => {
    // mock
    const frameId = addFrameNode(0);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();

    // action
    act(() => result.current.onScrub(45));

    // result
    expect(readRotation(frameId)).toBe(45);
  });

  it('should commit a new rotation on blur', () => {
    // mock
    const frameId = addFrameNode(0);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();
    const input = Object.assign(document.createElement('input'), { value: '90°' });

    // action
    act(() => result.current.onBlur({ target: input } as unknown as Parameters<typeof result.current.onBlur>[0]));

    // result
    expect(readRotation(frameId)).toBe(90);
  });

  it('should coalesce every scrub between onDragStart and onDragEnd into a single undo step', () => {
    // mock
    const frameId = addFrameNode(0);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnRotation();

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onScrub(10);
      result.current.onScrub(20);
      result.current.onScrub(30);
      result.current.onDragEnd();
    });

    expect(readRotation(frameId)).toBe(30);

    // action
    store.dispatch(undo());

    // result
    expect(readRotation(frameId)).toBe(0);
  });
});
