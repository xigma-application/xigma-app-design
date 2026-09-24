import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useVisibilityToggle } from '../useVisibilityToggle';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseVisibilityToggle = (): ReturnType<typeof renderHook<ReturnType<typeof useVisibilityToggle>, unknown>> =>
  renderHook(() => useVisibilityToggle(), { wrapper });

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

describe('useVisibilityToggle', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to visible when nothing is selected', () => {
    // result
    expect(renderUseVisibilityToggle().result.current.hidden).toBe(false);
  });

  it('should read the hidden state from the selected node', () => {
    const id = addRectangle({ hidden: true });

    store.dispatch(setSelection([id]));

    // result
    expect(renderUseVisibilityToggle().result.current.hidden).toBe(true);
  });

  it('should toggle the hidden flag on the selected node', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseVisibilityToggle();

    act(() => result.current.onToggle());

    expect(read(id).hidden).toBe(true);
  });

  it('should hide every node when only some are hidden, and show all of them when all are hidden', () => {
    // mock
    const firstId = addRectangle({ hidden: true });
    const secondId = addRectangle();

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderUseVisibilityToggle();

    // result
    expect(result.current.hidden).toBe(false);

    // action
    act(() => result.current.onToggle());

    // result
    expect([read(firstId).hidden, read(secondId).hidden]).toEqual([true, true]);
    expect(result.current.hidden).toBe(true);

    // action
    act(() => result.current.onToggle());

    // result
    expect([Boolean(read(firstId).hidden), Boolean(read(secondId).hidden)]).toEqual([false, false]);
  });
});
